/* ============================================
   数字乡村 · 共享工具库 (Shared Utils)
   四端共用 — 无障碍增强 + 通用函数
   v1.0  2026-08-09
   依赖：tokens.css / components.css
   说明：
   - showToast/showConfirm/openModal 采用"未定义才注入"策略，
     不覆盖各端已有实现；新页面引入本文件即可获得无障碍版本。
   - DV 命名空间提供格式化、URL 同步、动画偏好等纯函数。
   ============================================ */

(function () {
  'use strict';

  var DV = window.DV || (window.DV = {});

  /* ---- 动画偏好 ---- */
  DV.prefersReducedMotion = function () {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /* ---- HTML 转义 ---- */
  DV.escapeHtml = function (str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  /* ---- 数字格式化（Intl.NumberFormat）---- */
  DV.formatNumber = function (num, options) {
    if (num == null || num === '') return '';
    var n = Number(num);
    if (isNaN(n)) return String(num);
    return new Intl.NumberFormat('zh-CN', options || {}).format(n);
  };

  /* ---- 日期格式化（Intl.DateTimeFormat）---- */
  DV.formatDate = function (date, options) {
    if (!date) return '';
    var d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('zh-CN', options || { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  };

  DV.formatDateTime = function (date) {
    return DV.formatDate(date, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  /* ---- URL 状态同步：把表单值写入 query，或从 query 回填表单 ---- */
  // 从当前 URL 读取 query 回填到指定表单控件
  DV.restoreUrlState = function (formSelector) {
    var form = document.querySelector(formSelector);
    if (!form) return;
    var params = new URLSearchParams(window.location.search);
    form.querySelectorAll('input[name], select[name]').forEach(function (el) {
      var key = el.getAttribute('name');
      var val = params.get(key);
      if (val !== null) el.value = val;
    });
  };

  // 把指定表单的具名控件值写入 URL query（不触发跳转）
  DV.saveUrlState = function (formSelector) {
    var form = document.querySelector(formSelector);
    if (!form) return;
    var params = new URLSearchParams(window.location.search);
    form.querySelectorAll('input[name], select[name]').forEach(function (el) {
      var key = el.getAttribute('name');
      if (el.value) params.set(key, el.value);
      else params.delete(key);
    });
    var qs = params.toString();
    var newUrl = qs ? (window.location.pathname + '?' + qs) : window.location.pathname;
    window.history.replaceState({}, '', newUrl + window.location.hash);
  };

  /* ---- 焦点陷阱（模态内）---- */
  DV.trapFocus = function (container) {
    if (!container) return function () {};
    var sel = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    function handler(e) {
      if (e.key !== 'Tab') return;
      var nodes = container.querySelectorAll(sel);
      if (!nodes.length) return;
      var first = nodes[0];
      var last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    container.addEventListener('keydown', handler);
    return function () { container.removeEventListener('keydown', handler); };
  };

  /* ============================================
     Toast —— 带 aria-live 的无障碍版本
     签名兼容现有 showToast(message, type, duration)
     ============================================ */
  if (!window.showToast) {
    window.showToast = function (message, type, duration) {
      type = type || 'success';
      duration = duration || 3000;

      var container = document.querySelector('.toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        container.setAttribute('role', 'status');
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
      }

      var icons = {
        success: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.75l6 6 9-13.5"/></svg>',
        error: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        warning: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>',
        info: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/></svg>'
      };

      var toast = document.createElement('div');
      toast.className = 'toast toast-' + type;
      toast.setAttribute('role', 'alert');
      toast.innerHTML = (icons[type] || icons.info) + '<span>' + DV.escapeHtml(message) + '</span>';
      container.appendChild(toast);

      setTimeout(function () {
        toast.classList.add('hiding');
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
      }, duration);
    };
  }

  /* ============================================
     Confirm —— 焦点管理 + ESC + aria
     签名兼容现有 showConfirm({title,message,onConfirm,onCancel})
     ============================================ */
  if (!window.showConfirm) {
    window.showConfirm = function (options) {
      options = options || {};
      var title = options.title || '提示';
      var message = options.message || '确定执行此操作吗？';
      var confirmText = options.confirmText || '确定';
      var cancelText = options.cancelText || '取消';
      var onConfirm = options.onConfirm || function () {};
      var onCancel = options.onCancel || function () {};

      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay confirm-modal';
      overlay.style.display = 'flex';
      overlay.innerHTML =
        '<div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="cf-title">' +
        '  <div class="modal-header"><h3 class="modal-title" id="cf-title">' + DV.escapeHtml(title) + '</h3></div>' +
        '  <div class="modal-body"><p style="margin:0;color:var(--text-secondary)">' + DV.escapeHtml(message) + '</p></div>' +
        '  <div class="modal-footer">' +
        '    <button type="button" class="btn btn-secondary cf-cancel">' + DV.escapeHtml(cancelText) + '</button>' +
        '    <button type="button" class="btn btn-primary cf-ok">' + DV.escapeHtml(confirmText) + '</button>' +
        '  </div>' +
        '</div>';
      document.body.appendChild(overlay);

      var dialog = overlay.querySelector('.modal-content');
      var releaseTrap = DV.trapFocus(dialog);
      var okBtn = overlay.querySelector('.cf-ok');
      var cancelBtn = overlay.querySelector('.cf-cancel');

      function close() {
        releaseTrap();
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        document.removeEventListener('keydown', onKey);
      }
      function onKey(e) {
        if (e.key === 'Escape') { close(); onCancel(); }
      }

      okBtn.addEventListener('click', function () { close(); onConfirm(); });
      cancelBtn.addEventListener('click', function () { close(); onCancel(); });
      overlay.addEventListener('click', function (e) { if (e.target === overlay) { close(); onCancel(); } });
      document.addEventListener('keydown', onKey);

      // 聚焦确认按钮（ autoFocus 慎用，这里为模态主操作）
      setTimeout(function () { okBtn.focus(); }, 0);
    };
  }

  /* ============================================
     Modal 开关 —— 兼容 openModal(id)/closeModal(id)
     通过显隐 .modal-overlay 并管理焦点
     ============================================ */
  if (!window.openModal) {
    window.openModal = function (id) {
      var overlay = document.getElementById(id);
      if (!overlay) return;
      overlay.style.display = 'flex';
      overlay.setAttribute('aria-hidden', 'false');
      var dialog = overlay.querySelector('[role="dialog"]') || overlay.querySelector('.modal-content') || overlay.firstElementChild;
      if (dialog) {
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        DV._lastFocus = document.activeElement;
        DV._releaseTrap = DV.trapFocus(dialog);
        var focusable = dialog.querySelector('input, button, select, textarea, [tabindex]');
        if (focusable) setTimeout(function () { focusable.focus(); }, 0);
      }
    };
  }
  if (!window.closeModal) {
    window.closeModal = function (id) {
      var overlay = document.getElementById(id);
      if (!overlay) return;
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
      if (DV._releaseTrap) { DV._releaseTrap(); DV._releaseTrap = null; }
      if (DV._lastFocus && DV._lastFocus.focus) DV._lastFocus.focus();
    };
  }

  /* ---- 表格全选（统一）---- */
  DV.initTableSelectAll = function () {
    document.querySelectorAll('th .select-all').forEach(function (head) {
      head.setAttribute('aria-label', '全选当前页');
      head.addEventListener('change', function () {
        var table = head.closest('table');
        if (!table) return;
        table.querySelectorAll('tbody input[type="checkbox"]').forEach(function (cb) {
          cb.checked = head.checked;
        });
      });
    });
  };

  /* ---- 自动初始化 ---- */
  function init() {
    DV.initTableSelectAll();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
