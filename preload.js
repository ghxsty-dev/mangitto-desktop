const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mangittoAPI', {
  downloadChapter: (data) => ipcRenderer.invoke('download-chapter', data),
  getDownloads: () => ipcRenderer.invoke('get-downloads'),
  deleteDownload: (data) => ipcRenderer.invoke('delete-download', data),
  openDownloadFolder: () => ipcRenderer.invoke('open-download-folder'),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (_, data) => callback(data)),
  openPath: (filePath) => ipcRenderer.invoke('open-path', filePath),
  getChapterImages: (data) => ipcRenderer.invoke('get-chapter-images', data),
  checkOnline: () => ipcRenderer.invoke('check-online'),
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  navigateBack: () => ipcRenderer.invoke('navigate-back'),
  navigateForward: () => ipcRenderer.invoke('navigate-forward'),
  navigateRefresh: () => ipcRenderer.invoke('navigate-refresh'),
});
