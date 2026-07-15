(function() {
  if (window.__mangittoInjected) return;
  window.__mangittoInjected = true;

  var SVG = {
    back: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
    forward: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    refresh: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
    folder: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    minus: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    square: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>',
    x: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    download: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    spin: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="m-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>',
    chevron: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    book: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'
  };

  var style = document.createElement('style');
  style.textContent = '@keyframes s{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.m-spin{animation:s 1s linear infinite}';
  document.head.appendChild(style);



  function info() {
    var p = window.location.pathname.split('/').filter(Boolean);
    if (p.length >= 3 && p[0] === 'manga' && /^\d+$/.test(p[2])) return { s: p[1], c: p[2] };
    return null;
  }

  function title() {
    var e = document.querySelector('a[class*="text-4xl"]');
    return e ? e.textContent.trim() : '';
  }

  function imgs() {
    return Array.from(document.querySelectorAll('img[data-page-number]')).map(function(x) { return x.src; }).filter(function(s) { return s && !s.includes('error'); });
  }

  var titleBar = document.createElement('div');
  titleBar.id = 'm-titlebar';
  titleBar.style.cssText = 'position:fixed;top:0;left:0;right:0;height:40px;z-index:99998;display:flex;align-items:center;justify-content:space-between;-webkit-app-region:no-drag;';

  var leftGroup = document.createElement('div');
  leftGroup.style.cssText = 'display:flex;align-items:center;gap:2px;padding:0 8px;height:100%;';

  var rightGroup = document.createElement('div');
  rightGroup.style.cssText = 'display:flex;align-items:center;height:100%;';

  var dragArea = document.createElement('div');
  dragArea.style.cssText = 'flex:1;height:100%;-webkit-app-region:drag;';

  function makeBtn(svg, title, click) {
    var b = document.createElement('button');
    b.innerHTML = svg;
    b.title = title;
    b.style.cssText = 'background:none;border:none;color:#888;cursor:pointer;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:6px;transition:all 0.15s;';
    b.onmouseover = function() { b.style.color = 'white'; b.style.background = 'rgba(255,255,255,0.1)'; };
    b.onmouseout = function() { b.style.color = '#888'; b.style.background = 'none'; };
    b.onclick = click;
    return b;
  }

  function makeWinBtn(svg, click, hoverColor) {
    var b = document.createElement('button');
    b.innerHTML = svg;
    b.style.cssText = 'background:none;border:none;color:#888;cursor:pointer;width:42px;height:100%;display:flex;align-items:center;justify-content:center;transition:all 0.15s;';
    b.onmouseover = function() { b.style.background = hoverColor || 'rgba(255,255,255,0.1)'; };
    b.onmouseout = function() { b.style.background = 'none'; };
    b.onclick = click;
    return b;
  }

  leftGroup.appendChild(makeBtn(SVG.back, 'Geri', function() { window.mangittoAPI.navigateBack(); }));
  leftGroup.appendChild(makeBtn(SVG.forward, 'Ileri', function() { window.mangittoAPI.navigateForward(); }));
  leftGroup.appendChild(makeBtn(SVG.refresh, 'Yenile', function() { window.mangittoAPI.navigateRefresh(); }));
  leftGroup.appendChild(makeBtn(SVG.folder, 'Indirilenler', function() { showDownloadsPanel(); }));

  var chapterBtn = null;
  function updateChapterBtn() {
    if (chapterBtn && chapterBtn.parentNode) chapterBtn.parentNode.removeChild(chapterBtn);
    chapterBtn = null;
    var i = info();
    if (i) {
      chapterBtn = makeBtn(SVG.download, 'Bolumu Indir', function() { dload(chapterBtn); });
      leftGroup.appendChild(chapterBtn);
    }
  }
  updateChapterBtn();

  rightGroup.appendChild(makeWinBtn(SVG.minus, function() { window.mangittoAPI.windowMinimize(); }));
  rightGroup.appendChild(makeWinBtn(SVG.square, function() { window.mangittoAPI.windowMaximize(); }));
  rightGroup.appendChild(makeWinBtn(SVG.x, function() { window.mangittoAPI.windowClose(); }, 'rgba(255,80,80,0.3)'));

  titleBar.appendChild(leftGroup);
  titleBar.appendChild(dragArea);
  titleBar.appendChild(rightGroup);

  document.body.prepend(titleBar);

  document.body.style.paddingTop = '40px';
  document.documentElement.style.paddingTop = '0';

  async function dload(btn) {
    var i = info();
    if (!i) return;
    var images = imgs();
    if (!images.length) return;
    btn.innerHTML = SVG.spin; btn.disabled = true; btn.style.opacity = '0.6';
    try {
      await window.mangittoAPI.downloadChapter({ mangaSlug: i.s, mangaTitle: title(), chapterNumber: i.c, images: images, fansubId: '' });
      btn.innerHTML = SVG.check; btn.style.color = '#4CAF50';
      setTimeout(function() { btn.innerHTML = SVG.download; btn.disabled = false; btn.style.opacity = '1'; btn.style.color = '#888'; }, 2000);
    } catch(e) {
      btn.innerHTML = SVG.x; btn.style.color = '#f44';
      setTimeout(function() { btn.innerHTML = SVG.download; btn.disabled = false; btn.style.opacity = '1'; btn.style.color = '#888'; }, 2000);
    }
  }

  async function openReader(mangaSlug, chapterName) {
    try {
      var images = await window.mangittoAPI.getChapterImages({ mangaSlug: mangaSlug, chapterName: chapterName });
      if (!images || !images.length) { alert('Gorseller bulunamadi.'); return; }
      var ex = document.getElementById('mio'); if (ex) ex.remove();
      var o = document.createElement('div'); o.id = 'mio';
      o.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#0d0d0d;z-index:999999;display:flex;flex-direction:column;';

      var html = '';
      for (var k = 0; k < images.length; k++) {
        html += '<img src="' + images[k] + '" style="max-width:100%;width:800px;border-radius:4px;display:block;">';
      }
      var chapterNum = parseInt(chapterName.replace('bolum-', '')) || 0;
      var nextChapter = 'bolum-' + (chapterNum + 1);

      o.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:#0d0d0d;"><h2 style="margin:0;font-size:16px;color:white;">' + mangaSlug + ' - ' + chapterName + '</h2><button id="mc" style="background:none;border:none;color:white;cursor:pointer;padding:4px 8px;">' + SVG.x + '</button></div>' +
        '<div id="mrc" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;align-items:center;padding:20px;gap:8px;">' + html + '</div>' +
        '<div id="mnb" style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:#0d0d0d;gap:12px;"><div id="msi" style="flex:1;display:none;flex-direction:column;gap:6px;"><div id="mst" style="font-size:13px;color:#888;"></div><div style="background:rgba(255,255,255,0.1);border-radius:8px;height:6px;overflow:hidden;"><div id="mpb" style="width:0%;height:100%;background:#FBBC59;border-radius:8px;transition:width 0.3s;"></div></div></div><div style="display:flex;gap:8px;flex-shrink:0;" id="mna"><button id="myes" style="display:none;background:#FBBC59;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-weight:600;color:#1a1a2e;font-size:13px;">Evet</button><button id="mno" style="display:none;background:rgba(255,255,255,0.08);border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-weight:600;color:white;font-size:13px;">Hayir</button><button id="mnc" style="background:#FBBC59;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-weight:600;color:#1a1a2e;display:flex;align-items:center;gap:6px;font-size:13px;">' + SVG.download + ' ' + nextChapter + '</button></div></div>';
      document.body.appendChild(o);

      document.getElementById('mc').onclick = function() { o.remove(); };

      var si = document.getElementById('msi'), st = document.getElementById('mst'), pb = document.getElementById('mpb'), myes = document.getElementById('myes'), mno = document.getElementById('mno'), mnc = document.getElementById('mnc'), mna = document.getElementById('mna');

      function showStatus(msg) { si.style.display = 'flex'; st.textContent = msg; }
      function hideStatus() { si.style.display = 'none'; st.textContent = ''; pb.style.width = '0%'; }
      function showConfirm() { myes.style.display = ''; mno.style.display = ''; mnc.style.display = 'none'; }
      function hideConfirm() { myes.style.display = 'none'; mno.style.display = 'none'; mnc.style.display = ''; }

      mnc.onclick = async function() {
        try {
          var downloads = await window.mangittoAPI.getDownloads();
          var found = false;
          for (var x = 0; x < downloads.length; x++) {
            if (downloads[x].mangaSlug === mangaSlug && downloads[x].chapterName === nextChapter) {
              found = true;
              o.remove();
              openReader(mangaSlug, nextChapter);
              return;
            }
          }

          if (!found) {
            showConfirm();
            myes.onclick = async function() {
              hideConfirm();
              showStatus(nextChapter + ' indiriliyor... 0%');
              try {
                var resp = await fetch('https://mangtto.com/api/manga/' + mangaSlug + '/' + (chapterNum + 1));
                var apiData = await resp.json();
                if (!apiData || !apiData.success || !apiData.data || !apiData.data.chapter || !apiData.data.chapter.static || !apiData.data.chapter.static.length) { hideStatus(); alert('API hatasi.'); return; }

                var fansubId = apiData.data.chapter.static[0].fansubId;
                var pageCount = apiData.data.chapter.static[0].fileSize || 50;
                var chNum = apiData.data.chapter.chapter;
                var imgUrls = [];
                for (var p = 1; p <= pageCount; p++) {
                  imgUrls.push('https://cdn.zukrein.com/' + mangaSlug + '/' + chNum + '/' + p + '-' + fansubId + '.jpeg');
                }

                window.mangittoAPI.onDownloadProgress(function(progressData) {
                  if (progressData.mangaSlug === mangaSlug && progressData.chapterNumber === nextChapter) {
                    pb.style.width = progressData.percent + '%';
                    st.textContent = nextChapter + ' indiriliyor... ' + progressData.percent + '%';
                  }
                });

                await window.mangittoAPI.downloadChapter({ mangaSlug: mangaSlug, mangaTitle: mangaSlug, chapterNumber: String(chNum), images: imgUrls, fansubId: fansubId });

                hideStatus();
                o.remove();
                openReader(mangaSlug, nextChapter);
              } catch(e) {
                hideStatus();
                alert('Hata: ' + e.message);
              }
            };
            mno.onclick = function() { hideConfirm(); };
          }
        } catch(e) {
          alert('Hata: ' + e.message);
        }
      };

      function kh(e) { if (e.key === 'Escape') { o.remove(); document.removeEventListener('keydown', kh); } }
      document.addEventListener('keydown', kh);
    } catch(e) { alert('Hata: ' + e.message); }
  }

  function showDownloadsPanel() {
    var ex = document.getElementById('mdo'); if (ex) { ex.remove(); return; }
    var o = document.createElement('div'); o.id = 'mdo';
    o.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:999999;display:flex;align-items:center;justify-content:center;';
    var p = document.createElement('div');
    p.style.cssText = 'background:#0d0d0d;border-radius:16px;padding:24px;width:90%;max-width:600px;max-height:80vh;overflow-y:auto;color:white;box-shadow:0 20px 60px rgba(0,0,0,0.5);';
    p.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><h2 style="margin:0;font-size:20px;display:flex;align-items:center;gap:8px;color:white;">' + SVG.folder + ' Indirilenler</h2><button id="mcp" style="background:none;border:none;color:white;cursor:pointer;padding:4px;">' + SVG.x + '</button></div><div id="mdl" style="min-height:100px;"></div>';
    o.appendChild(p); document.body.appendChild(o);
    document.getElementById('mcp').onclick = function() { o.remove(); };
    o.onclick = function(e) { if (e.target === o) o.remove(); };
    loadList();
  }

  var groupsData = null;

  async function loadList() {
    var el = document.getElementById('mdl'); if (!el) return;
    el.innerHTML = '<div style="text-align:center;padding:20px;color:#888;">Yukleniyor...</div>';
    try {
      var d = await window.mangittoAPI.getDownloads();
      if (!d.length) { el.innerHTML = '<div style="text-align:center;padding:40px;color:#888;">Henuz indirilen bolum yok.</div>'; return; }

      groupsData = {};
      for (var i = 0; i < d.length; i++) {
        if (!groupsData[d[i].mangaSlug]) groupsData[d[i].mangaSlug] = [];
        groupsData[d[i].mangaSlug].push(d[i]);
      }

      var h = '';
      for (var manga in groupsData) {
        h += '<div class="mg" data-manga="' + manga + '" style="margin-bottom:4px;"><div class="mg-h" style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(255,255,255,0.04);border-radius:8px;cursor:pointer;transition:background 0.15s;"><span style="font-weight:600;font-size:15px;">' + manga + '</span><span class="mg-arrow" style="color:#888;display:flex;transition:transform 0.2s;">' + SVG.chevron + '</span></div><div class="mg-c" style="display:none;padding:4px 0 4px 14px;"></div></div>';
      }
      el.innerHTML = h;

      el.querySelectorAll('.mg-h').forEach(function(header) {
        header.addEventListener('click', function() {
          var container = header.parentElement.querySelector('.mg-c');
          var arrow = header.querySelector('.mg-arrow');
          if (container.style.display === 'none') {
            container.style.display = 'block';
            arrow.style.transform = 'rotate(90deg)';
            if (!container.children.length) renderChapters(container, header.parentElement.dataset.manga);
          } else {
            container.style.display = 'none';
            arrow.style.transform = 'rotate(0deg)';
          }
        });
      });
    } catch(e) { el.innerHTML = '<div style="text-align:center;padding:20px;color:#f44;">Hata.</div>'; }
  }

  function renderChapters(container, manga) {
    var chapters = groupsData[manga];
    if (!chapters) return;
    var h = '';
    for (var j = 0; j < chapters.length; j++) {
      h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:rgba(255,255,255,0.03);border-radius:6px;margin-bottom:4px;"><div><div style="font-weight:500;font-size:13px;">' + chapters[j].chapterName + '</div><div style="font-size:11px;color:#888;">' + chapters[j].pageCount + ' sayfa</div></div><button class="mr" data-s="' + chapters[j].mangaSlug + '" data-c="' + chapters[j].chapterName + '" style="background:#4CAF50;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-weight:600;font-size:11px;color:white;display:flex;align-items:center;gap:4px;">' + SVG.book + ' Oku</button></div>';
    }
    container.innerHTML = h;
    container.querySelectorAll('.mr').forEach(function(b) { b.addEventListener('click', function() { openReader(b.dataset.s, b.dataset.c); }); });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { var o = document.getElementById('mdo'); if (o) o.remove(); }
  });

  var lastPath = window.location.pathname;
  var ob = new MutationObserver(function() {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      setTimeout(function() { updateChapterBtn(); }, 500);
    }
  });
  ob.observe(document.body, { childList: true, subtree: true });
})();
