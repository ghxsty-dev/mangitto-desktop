const { app, BrowserWindow, ipcMain, dialog, session } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

let mainWindow;
const downloadsDir = path.join(app.getPath('documents'), 'Mangitto Downloads');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    protocol.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        downloadImage(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(dest);
      });
      file.on('error', (err) => {
        file.close();
        fs.unlinkSync(dest);
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

ipcMain.handle('download-chapter', async (event, { mangaSlug, mangaTitle, chapterNumber, images, fansubId }) => {
  const chapterDir = path.join(downloadsDir, mangaSlug, `bolum-${chapterNumber}`);
  ensureDir(chapterDir);

  const results = [];
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const ext = path.extname(new URL(img).pathname) || '.jpeg';
    const filename = `${String(i + 1).padStart(3, '0')}${ext}`;
    const dest = path.join(chapterDir, filename);
    try {
      await downloadImage(img, dest);
      results.push({ page: i + 1, status: 'ok', file: filename });
    } catch (err) {
      results.push({ page: i + 1, status: 'error', error: err.message });
    }
    event.sender.send('download-progress', {
      mangaSlug,
      chapterNumber: 'bolum-' + chapterNumber,
      current: i + 1,
      total: images.length,
      percent: Math.round(((i + 1) / images.length) * 100)
    });
  }
  return { mangaSlug: images[0]?.split('/')?.[3], chapter: images[0]?.split('/')?.[4], results };
});

ipcMain.handle('get-downloads', async () => {
  const list = [];
  if (!fs.existsSync(downloadsDir)) return list;
  const mangas = fs.readdirSync(downloadsDir);
  for (const manga of mangas) {
    const mangaPath = path.join(downloadsDir, manga);
    if (fs.statSync(mangaPath).isDirectory()) {
      const chapters = fs.readdirSync(mangaPath);
      for (const chapter of chapters) {
        const chapterPath = path.join(mangaPath, chapter);
        if (fs.statSync(chapterPath).isDirectory()) {
          const files = fs.readdirSync(chapterPath).filter(f => f.match(/\.(jpe?g|png|webp)$/i));
          list.push({
            mangaSlug: manga,
            chapterName: chapter,
            pageCount: files.length,
            path: chapterPath
          });
        }
      }
    }
  }
  return list;
});

ipcMain.handle('delete-download', async (event, { mangaSlug, chapterName }) => {
  const chapterPath = path.join(downloadsDir, mangaSlug, chapterName);
  if (fs.existsSync(chapterPath)) {
    fs.rmSync(chapterPath, { recursive: true, force: true });
    return { success: true };
  }
  return { success: false, error: 'Bulunamadı' };
});

ipcMain.handle('open-download-folder', async () => {
  const { shell } = require('electron');
  ensureDir(downloadsDir);
  shell.openPath(downloadsDir);
});

ipcMain.handle('open-path', async (event, filePath) => {
  const { shell } = require('electron');
  shell.openPath(filePath);
});

ipcMain.handle('get-chapter-images', async (event, { mangaSlug, chapterName }) => {
  const chapterPath = path.join(downloadsDir, mangaSlug, chapterName);
  if (!fs.existsSync(chapterPath)) return [];
  const files = fs.readdirSync(chapterPath)
    .filter(f => f.match(/\.(jpe?g|png|webp)$/i))
    .sort();
  return files.map(f => {
    const filePath = path.join(chapterPath, f);
    const ext = path.extname(f).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    const data = fs.readFileSync(filePath);
    return `data:${mime};base64,${data.toString('base64')}`;
  });
});

ipcMain.handle('window-minimize', () => { if (mainWindow) mainWindow.minimize(); });
ipcMain.handle('window-maximize', () => { if (mainWindow) { if (mainWindow.isMaximized()) mainWindow.unmaximize(); else mainWindow.maximize(); } });
ipcMain.handle('window-close', () => { if (mainWindow) mainWindow.close(); });
ipcMain.handle('navigate-back', () => { if (mainWindow && mainWindow.webContents.canGoBack()) mainWindow.webContents.goBack(); });
ipcMain.handle('navigate-forward', () => { if (mainWindow && mainWindow.webContents.canGoForward()) mainWindow.webContents.goForward(); });
ipcMain.handle('navigate-refresh', () => { if (mainWindow) mainWindow.webContents.reload(); });

ipcMain.handle('get-app-version', () => require('./package.json').version);

ipcMain.handle('check-online', async () => {
  return new Promise((resolve) => {
    const req = https.get('https://mangtto.com', { timeout: 5000 }, (res) => {
      resolve(true);
      res.destroy();
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, 'public', 'logo.png'),
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
    },
    title: 'Mangitto',
    autoHideMenuBar: true,
  });

  const injectScript = fs.readFileSync(path.join(__dirname, 'inject.js'), 'utf-8');
  const readerPath = path.join(__dirname, 'reader.html');

  async function tryLoadOnline() {
    const online = await checkConnectivity();
    if (online) {
      mainWindow.loadURL('https://mangtto.com/');
    } else {
      mainWindow.loadFile(readerPath);
    }
  }

  function checkConnectivity() {
    return new Promise((resolve) => {
      const req = https.get('https://mangtto.com', { timeout: 5000 }, (res) => {
        resolve(true);
        res.destroy();
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
    });
  }

  const injectMangitto = () => {
    const url = mainWindow.webContents.getURL();
    if (url.startsWith('https://mangtto.com')) {
      mainWindow.webContents.executeJavaScript(injectScript).catch(() => {});
    }
  };

  mainWindow.webContents.on('dom-ready', injectMangitto);
  mainWindow.webContents.on('did-navigate', injectMangitto);
  mainWindow.webContents.on('did-navigate-in-page', injectMangitto);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://mangtto.com')) {
      mainWindow.loadURL(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('did-fail-load', async () => {
    const url = mainWindow.webContents.getURL();
    if (url.startsWith('https://mangtto.com')) {
      mainWindow.loadFile(readerPath);
    }
  });

  mainWindow.maximize();

  tryLoadOnline();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
