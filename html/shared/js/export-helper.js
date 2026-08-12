/* ============================================
   数据列表导出工具（export-helper.js）
   ------------------------------------------------------------
   - 自动绑定所有带 .btn-export 类的导出按钮，点击弹出「导出格式选择」弹窗
   - 读取当前可见 Tab 面板中的第一个 .data-table 表格数据
   - 支持导出：Excel(.xls) / Word(.doc) / PDF(打印) / JPG(图片) / TXT(文本)
   用法：在页面中引入本文件，并把导出按钮加上 class="btn-export" 即可。
   ============================================ */
(function () {
  'use strict';

  var FORMATS = [
    { key: 'excel', label: 'Excel', color: '#16a34a', desc: '.xls 表格' },
    { key: 'word',  label: 'Word',  color: '#2563eb', desc: '.doc 文档' },
    { key: 'pdf',   label: 'PDF',   color: '#dc2626', desc: '打印/存 PDF' },
    { key: 'jpg',   label: 'JPG',   color: '#d97706', desc: '导出为图片' },
    { key: 'txt',   label: 'TXT',   color: '#6b7280', desc: '纯文本' }
  ];

  /* ---- 定位当前可见表格 ---- */
  function currentTable() {
    var panels = document.querySelectorAll('.tab-panel');
    var table = null;
    for (var i = 0; i < panels.length; i++) {
      if (panels[i].style.display !== 'none') {
        table = panels[i].querySelector('.data-table');
        if (table) break;
      }
    }
    if (!table) table = document.querySelector('.data-table');
    return table;
  }

  function currentTabName() {
    var t = document.querySelector('.tab-item.active');
    return t ? t.textContent.trim() : '';
  }

  function pageTitle() {
    var h = document.querySelector('.dv-page-header h2');
    if (h && h.textContent.trim()) return h.textContent.trim();
    return (document.title.split(' - ')[0] || '数据').trim();
  }

  function collect() {
    var table = currentTable();
    if (!table) return null;
    var head = [];
    Array.prototype.forEach.call(table.querySelectorAll('thead th'), function (th) { head.push(th.textContent.trim()); });
    var rows = [];
    Array.prototype.forEach.call(table.querySelectorAll('tbody tr'), function (tr) {
      var cells = [];
      Array.prototype.forEach.call(tr.querySelectorAll('td'), function (td) { cells.push(td.textContent.trim()); });
      rows.push(cells);
    });
    return {
      head: head,
      rows: rows,
      title: pageTitle() + (currentTabName() ? '·' + currentTabName() : '')
    };
  }

  /* ---- 工具 ---- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function stamp() {
    var d = new Date();
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '_' + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
  }
  function download(filename, content, mime) {
    var blob = content instanceof Blob ? content : new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 120);
  }
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function tableHtml(data) {
    var html = '<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;font-family:微软雅黑,Arial,sans-serif;">';
    if (data.head && data.head.length) {
      html += '<thead><tr>' + data.head.map(function (h) { return '<th style="background:#f0fdf4;font-weight:bold;">' + escapeHtml(h) + '</th>'; }).join('') + '</tr></thead>';
    }
    html += '<tbody>';
    data.rows.forEach(function (r) {
      html += '<tr>' + r.map(function (c) { return '<td>' + escapeHtml(c) + '</td>'; }).join('') + '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  /* ---- 各格式导出 ---- */
  function exportExcel(data) {
    var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body>' + tableHtml(data) + '</body></html>';
    download(data.title + '_' + stamp() + '.xls', '\ufeff' + html, 'application/vnd.ms-excel;charset=utf-8');
  }
  function exportWord(data) {
    var html = '<html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body><h3>' + escapeHtml(data.title) + '</h3>' + tableHtml(data) + '</body></html>';
    download(data.title + '_' + stamp() + '.doc', '\ufeff' + html, 'application/msword;charset=utf-8');
  }
  function exportTxt(data) {
    var lines = [];
    if (data.head && data.head.length) lines.push(data.head.join('\t'));
    data.rows.forEach(function (r) { lines.push(r.join('\t')); });
    download(data.title + '_' + stamp() + '.txt', '\ufeff' + lines.join('\r\n'), 'text/plain;charset=utf-8');
  }
  function exportPdf(data) {
    var win = window.open('', '_blank');
    if (!win) {
      if (window.showToast) window.showToast('浏览器拦截了弹窗，请允许后重试', 'warning');
      return;
    }
    win.document.write(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + escapeHtml(data.title) + '</title>' +
      '<style>body{font-family:微软雅黑,Arial,sans-serif;padding:16px;}h3{margin:0 0 12px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #999;padding:6px 8px;font-size:13px;text-align:left;}th{background:#f0fdf4;font-weight:bold;}</style></head><body>' +
      '<h3>' + escapeHtml(data.title) + '</h3>' + tableHtml(data) +
      '<script>setTimeout(function(){window.print();},300);<\/script>' +
      '</body></html>'
    );
    win.document.close();
  }
  function exportJpg(data) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var fontSize = 13, rowH = 26, headerH = 32, padX = 10;
    ctx.font = fontSize + 'px "Microsoft YaHei", Arial, sans-serif';
    var headArr = data.head && data.head.length ? data.head : (data.rows[0] || []).map(function () { return ''; });
    var colWidths = headArr.map(function (h, i) {
      var w = ctx.measureText(h).width;
      data.rows.forEach(function (r) {
        if (r[i]) { var t = ctx.measureText(String(r[i])).width; if (t > w) w = t; }
      });
      return Math.ceil(w + padX * 2);
    });
    var rows = data.rows.slice(0, 50);
    var totalW = colWidths.reduce(function (a, b) { return a + b; }, 0) + 2;
    var totalH = headerH + rows.length * rowH + 2;
    canvas.width = Math.max(totalW, 320);
    canvas.height = totalH + 24;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 标题
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 15px "Microsoft YaHei", Arial';
    ctx.fillText(data.title, 2, 18);
    ctx.font = fontSize + 'px "Microsoft YaHei", Arial';
    // 表头
    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(1, 24, totalW - 2, headerH - 1);
    ctx.fillStyle = '#14532d';
    var x = 1;
    colWidths.forEach(function (w, i) {
      ctx.fillText(headArr[i], x + padX, 45);
      x += w;
    });
    // 数据
    rows.forEach(function (r, ri) {
      var y = headerH + ri * rowH;
      if (ri % 2 === 1) { ctx.fillStyle = '#f9fafb'; ctx.fillRect(1, y, totalW - 2, rowH); }
      ctx.fillStyle = '#1f2937';
      var cx = 1;
      colWidths.forEach(function (w, ci) {
        var text = String(r[ci] == null ? '' : r[ci]);
        var maxChars = Math.max(1, Math.floor((w - padX * 2) / fontSize * 0.5));
        ctx.fillText(text.length > maxChars ? text.substring(0, maxChars) + '…' : text, cx + padX, y + 19);
        cx += w;
      });
    });
    // 边框
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 24, totalW - 2, totalH - 24 - 1);
    var yPos = 24 + headerH;
    for (var i = 0; i <= rows.length; i++) {
      ctx.beginPath(); ctx.moveTo(1, yPos); ctx.lineTo(totalW - 1, yPos); ctx.stroke();
      yPos += rowH;
    }
    var xPos = 1;
    colWidths.forEach(function (w) {
      xPos += w;
      ctx.beginPath(); ctx.moveTo(xPos, 24); ctx.lineTo(xPos, totalH - 1); ctx.stroke();
    });
    canvas.toBlob(function (blob) {
      if (blob) download(data.title + '_' + stamp() + '.jpg', blob, 'image/jpeg');
    }, 'image/jpeg', 0.92);
  }

  function runExport(fmt, data) {
    if (!data || !data.rows.length) {
      if (window.showToast) window.showToast('暂无可导出的数据', 'warning');
      return;
    }
    try {
      if (fmt === 'excel') exportExcel(data);
      else if (fmt === 'word') exportWord(data);
      else if (fmt === 'pdf') exportPdf(data);
      else if (fmt === 'jpg') exportJpg(data);
      else if (fmt === 'txt') exportTxt(data);
      if (fmt !== 'pdf' && window.showToast) window.showToast('导出成功', 'success');
    } catch (err) {
      if (window.showToast) window.showToast('导出失败：' + (err && err.message ? err.message : err), 'error');
    }
  }

  /* ---- 导出格式选择弹窗 ---- */
  var dialog = null;
  function closeDialog() {
    if (dialog && dialog.parentNode) dialog.parentNode.removeChild(dialog);
    dialog = null;
  }
  function openDialog() {
    closeDialog();
    var data = collect();
    if (!data || !data.rows.length) {
      if (window.showToast) window.showToast('暂无可导出的数据', 'warning');
      return;
    }
    dialog = document.createElement('div');
    dialog.className = 'modal-overlay show dv-export-dialog';
    dialog.style.zIndex = '99999';
    dialog.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" style="width:540px;max-width:92vw;border-radius:12px;overflow:hidden;">' +
      '  <div class="modal-header" style="padding:16px 24px;background:#fff;border-bottom:1px solid #eef0f3;display:flex;align-items:center;justify-content:space-between;">' +
      '    <h3 style="margin:0;font-size:16px;font-weight:600;color:#1f2937;display:flex;align-items:center;gap:8px;">' +
      '      <svg aria-hidden="true" width="18" height="18" fill="none" stroke="#16a34a" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>导出数据' +
      '    </h3>' +
      '    <button type="button" class="modal-close" style="width:32px;height:32px;border:none;background:transparent;font-size:22px;line-height:1;color:#6b7280;cursor:pointer;border-radius:8px;">&times;</button>' +
      '  </div>' +
      '  <div class="modal-body" style="padding:24px;">' +
      '    <p style="margin:0 0 16px;font-size:13px;color:#6b7280;">选择导出格式，将当前「' + escapeHtml(data.title) + '」数据列表导出：</p>' +
      '    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;">' +
      FORMATS.map(function (f) {
        return '<button type="button" class="dv-export-item" data-format="' + f.key + '" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 6px;border:1px solid #eef0f3;border-radius:10px;background:#fff;cursor:pointer;transition:all .15s;outline:none;">' +
          '<svg aria-hidden="true" width="28" height="28" fill="none" stroke="' + f.color + '" stroke-width="1.6" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>' +
          '<span style="font-size:13px;font-weight:600;color:#1f2937;">' + f.label + '</span>' +
          '<span style="font-size:11px;color:#9ca3af;">' + f.desc + '</span>' +
          '</button>';
      }).join('') +
      '    </div>' +
      '  </div>' +
      '  <div class="modal-footer" style="padding:14px 24px;border-top:1px solid #eef0f3;background:#fafafa;display:flex;justify-content:flex-end;">' +
      '    <button type="button" class="dv-export-cancel btn" style="height:34px;padding:0 20px;font-size:13px;border-radius:8px;border:1px solid #d1d5db;background:#fff;color:#374151;cursor:pointer;">关 闭</button>' +
      '  </div>' +
      '</div>';
    var closeBtn = dialog.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeDialog);
    var cancelBtn = dialog.querySelector('.dv-export-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', closeDialog);
    dialog.addEventListener('click', function (e) { if (e.target === dialog) closeDialog(); });
    Array.prototype.forEach.call(dialog.querySelectorAll('.dv-export-item'), function (btn) {
      btn.addEventListener('mouseenter', function () { btn.style.borderColor = '#16a34a'; btn.style.background = '#f0fdf4'; });
      btn.addEventListener('mouseleave', function () { btn.style.borderColor = '#eef0f3'; btn.style.background = '#fff'; });
      btn.addEventListener('click', function () {
        var fmt = btn.getAttribute('data-format');
        closeDialog();
        runExport(fmt, collect());
      });
    });
    document.body.appendChild(dialog);
  }

  /* ---- 全局 API + 按钮绑定 ---- */
  window.dvExport = {
    open: openDialog,
    exportCurrent: function (fmt) { runExport(fmt, collect()); }
  };
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('.btn-export') : null;
    if (btn) { e.preventDefault(); openDialog(); }
  });
})();
