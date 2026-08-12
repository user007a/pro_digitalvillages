/* ============================================
   数字乡村管理系统 - 后台交互逻辑
   ============================================ */

(function () {
  'use strict';

  /* ---- 侧边栏折叠/展开 ---- */
  function initSidebar() {
    var sidebar = document.querySelector('.sidebar');
    var contentArea = document.querySelector('.content-area');
    var collapseBtn = document.querySelector('.collapse-btn');
    if (!sidebar || !collapseBtn) return;

    collapseBtn.addEventListener('click', function () {
      sidebar.classList.toggle('collapsed');
      if (contentArea) {
        contentArea.classList.toggle('expanded', sidebar.classList.contains('collapsed'));
      }
    });
  }

  /* ---- 一级菜单展开/折叠 ---- */
  function initNavMenu() {
    var navItems = document.querySelectorAll('.sidebar .nav-item');
    navItems.forEach(function (item) {
      var title = item.querySelector('.nav-title');
      if (!title) return;

      title.addEventListener('click', function () {
        var subMenu = item.querySelector('.sub-menu');
        if (!subMenu) return;

        // 关闭其他已展开的菜单
        var siblings = item.parentElement.querySelectorAll('.nav-item.open');
        siblings.forEach(function (sibling) {
          if (sibling !== item) sibling.classList.remove('open');
        });

        item.classList.toggle('open');
      });
    });
  }

  /* ---- 当前菜单项高亮 ---- */
  function highlightMenuItem() {
    var currentUrl = window.location.href;
    var subItems = document.querySelectorAll('.sidebar .sub-item');
    subItems.forEach(function (item) {
      var link = item.querySelector('a');
      if (link && currentUrl.indexOf(link.getAttribute('href')) !== -1) {
        item.classList.add('active');
        // 展开父级菜单
        var parentNav = item.closest('.nav-item');
        if (parentNav) parentNav.classList.add('open');
      }
    });

    // 如果没有匹配的子菜单，检查一级菜单（如首页）
    var navItems = document.querySelectorAll('.sidebar .nav-item');
    navItems.forEach(function (item) {
      var title = item.querySelector('.nav-title');
      var link = title ? title.querySelector('a') : null;
      if (link && currentUrl.indexOf(link.getAttribute('href')) !== -1) {
        item.classList.add('active');
      }
    });
  }

  /* ---- 弹窗打开/关闭（含焦点管理 + ESC）---- */
  var _lastFocus = null;
  var _releaseTrap = null;

  function _trapFocus(container) {
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
  }

  window.openModal = function (id) {
    var overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    var dialog = overlay.querySelector('.modal');
    if (dialog) {
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      var labelledby = dialog.querySelector('.modal-header h3, .modal-title');
      if (labelledby) {
        if (!labelledby.id) labelledby.id = 'modal-title-' + Date.now();
        dialog.setAttribute('aria-labelledby', labelledby.id);
      }
      _lastFocus = document.activeElement;
      _releaseTrap = _trapFocus(dialog);
      var focusable = dialog.querySelector('input, select, textarea, button, [tabindex]');
      if (focusable) setTimeout(function () { focusable.focus(); }, 0);
    }
  };

  window.closeModal = function (id) {
    var overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    if (_releaseTrap) { _releaseTrap(); _releaseTrap = null; }
    if (_lastFocus && _lastFocus.focus) _lastFocus.focus();
  };

  // 点击遮罩关闭弹窗 + ESC 关闭
  function initModals() {
    document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
      if (overlay.dataset.modalBound) return;
      overlay.dataset.modalBound = '1';
      overlay.setAttribute('aria-hidden', 'true');
      var dialog = overlay.querySelector('.modal');
      if (dialog) {
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
      }
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          overlay.classList.remove('show');
          overlay.setAttribute('aria-hidden', 'true');
          if (_releaseTrap) { _releaseTrap(); _releaseTrap = null; }
          if (_lastFocus && _lastFocus.focus) _lastFocus.focus();
        }
      });
      overlay.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('show')) {
          overlay.classList.remove('show');
          overlay.setAttribute('aria-hidden', 'true');
          if (_releaseTrap) { _releaseTrap(); _releaseTrap = null; }
          if (_lastFocus && _lastFocus.focus) _lastFocus.focus();
        }
      });
    });
  }

  /* ---- 确认弹窗（焦点管理 + ESC）---- */
  window.showConfirm = function (options) {
    options = options || {};
    var title = options.title || '提示';
    var message = options.message || '确定执行此操作吗？';
    var confirmText = options.confirmText || '确定';
    var cancelText = options.cancelText || '取消';
    var onConfirm = options.onConfirm || function () {};
    var onCancel = options.onCancel || function () {};

    function escapeHtml(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    var isDanger = options.variant === 'danger' || options.danger === true ||
      /删除|移除|注销|清空|作废|不可恢复/.test(title + message);
    var iconSvg = isDanger
      ? '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
      : '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';

    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay confirm-modal show' + (isDanger ? ' confirm-danger' : '');
    overlay.id = 'confirm-modal-' + Date.now();
    var titleId = 'cf-title-' + Date.now();
    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="' + titleId + '">' +
      '  <div class="modal-body">' +
      '    <div class="confirm-flex">' +
      '      <div class="confirm-icon" aria-hidden="true">' + iconSvg + '</div>' +
      '      <div class="confirm-text">' +
      '        <div class="confirm-title" id="' + titleId + '">' + escapeHtml(title) + '</div>' +
      '        <div class="confirm-message">' + escapeHtml(message) + '</div>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="modal-footer">' +
      '    <button type="button" class="btn cancel-btn">' + escapeHtml(cancelText) + '</button>' +
      '    <button type="button" class="btn ' + (isDanger ? 'btn-danger' : 'btn-primary') + ' confirm-btn">' + escapeHtml(confirmText) + '</button>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(overlay);
    var dialog = overlay.querySelector('.modal');
    var releaseTrap = _trapFocus(dialog);
    var okBtn = overlay.querySelector('.confirm-btn');
    var cancelBtn = overlay.querySelector('.cancel-btn');
    _lastFocus = document.activeElement;

    function close() {
      releaseTrap();
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.removeEventListener('keydown', onKey);
      if (_lastFocus && _lastFocus.focus) _lastFocus.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') { close(); onCancel(); }
    }

    okBtn.addEventListener('click', function () { close(); onConfirm(); });
    cancelBtn.addEventListener('click', function () { close(); onCancel(); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) { close(); onCancel(); } });
    document.addEventListener('keydown', onKey);

    setTimeout(function () { okBtn.focus(); }, 0);
  };

  /* ---- Toast消息（带 aria-live 无障碍）---- */
  function initToastContainer() {
    var container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }
    return container;
  }

  window.showToast = function (message, type, duration) {
    type = type || 'success';
    duration = duration || 3000;

    var container = initToastContainer();

    var icons = {
      success: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>',
      error: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6m0-6l6 6"/></svg>',
      warning: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>',
      info: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>'
    };

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = '<span aria-hidden="true">' + (icons[type] || '') + '</span><span>' + message + '</span>';
    container.appendChild(toast);

    setTimeout(function () {
      toast.classList.add('hiding');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  };

  /* ---- 导出弹窗：选择导出格式（图片 / Excel / PDF / TXT） ---- */
  window.selectExportFormat = function (btn) {
    var grid = btn.closest('.export-format-grid');
    if (grid) {
      grid.querySelectorAll('.export-format').forEach(function (el) { el.classList.remove('active'); });
    }
    btn.classList.add('active');
  };

  /* ---- Tab切换 ---- */
  window.initTabs = function (containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return;

    var tabs = container.querySelectorAll('[data-tab]');
    var panels = container.querySelectorAll('[data-tab-panel]');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var targetId = tab.getAttribute('data-tab');

        tabs.forEach(function (t) { t.classList.remove('active'); });
        panels.forEach(function (p) { p.style.display = 'none'; });

        tab.classList.add('active');
        var target = container.querySelector('[data-tab-panel="' + targetId + '"]');
        if (target) target.style.display = 'block';
      });
    });
  };

  /* ---- 表格全选/取消全选（含 aria-label）---- */
  function initTableCheckboxes() {
    // 表头全选：兼容 .select-all 类与 th 内任意 checkbox
    var headerCheckboxes = document.querySelectorAll('th input[type="checkbox"]');
    headerCheckboxes.forEach(function (headerCheckbox) {
      if (headerCheckbox.dataset.bound) return;
      headerCheckbox.dataset.bound = '1';
      if (!headerCheckbox.classList.contains('select-all')) {
        headerCheckbox.classList.add('select-all');
      }
      if (!headerCheckbox.getAttribute('aria-label')) {
        headerCheckbox.setAttribute('aria-label', '全选当前页');
      }
      headerCheckbox.addEventListener('change', function () {
        var table = headerCheckbox.closest('table');
        if (!table) return;
        var checkboxes = table.querySelectorAll('tbody input[type="checkbox"]');
        checkboxes.forEach(function (cb) {
          cb.checked = headerCheckbox.checked;
          if (!cb.getAttribute('aria-label')) {
            cb.setAttribute('aria-label', '选择该行');
          }
        });
      });
    });
  }

  /* ---- 下拉菜单 ---- */
  function initDropdowns() {
    document.querySelectorAll('.user-menu').forEach(function (menu) {
      menu.addEventListener('click', function (e) {
        e.stopPropagation();
        var dropdown = menu.querySelector('.dropdown-menu');
        if (!dropdown) return;
        var isOpen = dropdown.classList.contains('show');
        // 先关闭所有下拉
        document.querySelectorAll('.dropdown-menu.show').forEach(function (d) {
          d.classList.remove('show');
        });
        menu.classList.remove('open');
        if (!isOpen) {
          dropdown.classList.add('show');
          menu.classList.add('open');
        }
      });
    });

    // 点击其他区域关闭下拉
    document.addEventListener('click', function () {
      document.querySelectorAll('.dropdown-menu.show').forEach(function (d) {
        d.classList.remove('show');
      });
      document.querySelectorAll('.user-menu.open').forEach(function (m) {
        m.classList.remove('open');
      });
    });
  }

  /* ---- 导航iframe加载 ---- */
  window.loadPage = function (url, navItem, subItem) {
    var iframe = document.querySelector('.content-area iframe');
    if (!iframe) return;

    // 添加淡入过渡动画
    iframe.style.opacity = '0';
    iframe.style.transition = 'opacity 0.25s ease-in-out';

    iframe.src = url;

    // 页面加载完成后淡入显示
    var onLoaded = function () {
      iframe.style.opacity = '1';
      iframe.removeEventListener('load', onLoaded);
    };
    iframe.addEventListener('load', onLoaded);

    // 兜底：如果 load 事件未触发（如 about:blank），300ms 后强制淡入
    setTimeout(function () {
      iframe.style.opacity = '1';
    }, 300);

    // 更新菜单高亮
    document.querySelectorAll('.sidebar .nav-item.active').forEach(function (el) {
      el.classList.remove('active');
    });
    document.querySelectorAll('.sidebar .sub-item.active').forEach(function (el) {
      el.classList.remove('active');
    });

    if (navItem) {
      navItem.classList.add('active');
      var subMenu = navItem.querySelector('.sub-menu');
      if (subMenu) navItem.classList.add('open');
    }
    if (subItem) {
      subItem.classList.add('active');
    }
  };

  /* ---- 树节点展开/折叠 ---- */
  window.toggleTreeNode = function (toggleEl) {
    var nodeLi = toggleEl.closest('li');
    if (!nodeLi) return;
    var children = nodeLi.querySelector('.tree-children');
    if (!children) return;

    toggleEl.classList.toggle('expanded');
    children.classList.toggle('collapsed');
  };

  window.expandAllTree = function () {
    document.querySelectorAll('.tree-children.collapsed').forEach(function (el) {
      el.classList.remove('collapsed');
    });
    document.querySelectorAll('.toggle-icon:not(.expanded)').forEach(function (el) {
      el.classList.add('expanded');
    });
  };

  window.collapseAllTree = function () {
    document.querySelectorAll('.tree-children').forEach(function (el) {
      el.classList.add('collapsed');
    });
    document.querySelectorAll('.toggle-icon.expanded').forEach(function (el) {
      el.classList.remove('expanded');
    });
  };

  window.selectTreeNode = function (el) {
    document.querySelectorAll('.node-content.active').forEach(function (n) {
      n.classList.remove('active');
    });
    el.classList.add('active');
  };

  /* ---- 折叠面板（collapse-panel） ---- */
  function initCollapsePanels() {
    document.querySelectorAll('.collapse-panel > .collapse-header').forEach(function (header) {
      header.style.cursor = 'pointer';
      header.addEventListener('click', function () {
        var panel = header.parentElement;
        var body = panel.querySelector('.collapse-body');
        if (!body) return;

        var isCollapsed = panel.classList.contains('collapsed');

        if (isCollapsed) {
          // 展开：先设置高度为 auto 获取实际高度，再从 0 过渡到 auto
          panel.classList.remove('collapsed');
          body.style.display = 'block';
          var fullHeight = body.scrollHeight + 'px';
          body.style.height = '0';
          body.style.overflow = 'hidden';
          body.style.transition = 'height 0.3s ease';

          // 触发重绘后设置目标高度
          body.offsetHeight; // force reflow
          body.style.height = fullHeight;

          // 过渡结束后清除内联样式，让内容自适应
          var onEnd = function () {
            body.style.height = '';
            body.style.overflow = '';
            body.style.transition = '';
            body.removeEventListener('transitionend', onEnd);
          };
          body.addEventListener('transitionend', onEnd);
        } else {
          // 折叠：从当前高度过渡到 0
          body.style.height = body.scrollHeight + 'px';
          body.style.overflow = 'hidden';
          body.style.transition = 'height 0.3s ease';

          // 触发重绘后设置高度为 0
          body.offsetHeight; // force reflow
          body.style.height = '0';

          var onEnd = function () {
            if (panel.classList.contains('collapsed')) {
              body.style.display = 'none';
            }
            body.style.height = '';
            body.style.overflow = '';
            body.style.transition = '';
            body.removeEventListener('transitionend', onEnd);
          };
          body.addEventListener('transitionend', onEnd);

          panel.classList.add('collapsed');
        }
      });
    });
  }

  /* ---- 可折叠记录区域（collapsible-section） ---- */
  function initCollapsibleSections() {
    document.querySelectorAll('.collapsible-section > .collapsible-header').forEach(function (header) {
      header.style.cursor = 'pointer';
      header.addEventListener('click', function () {
        var section = header.parentElement;
        var body = section.querySelector('.collapsible-body');
        if (!body) return;

        var isCollapsed = section.classList.contains('collapsed');

        if (isCollapsed) {
          section.classList.remove('collapsed');
          body.style.display = 'block';
          var fullHeight = body.scrollHeight + 'px';
          body.style.height = '0';
          body.style.overflow = 'hidden';
          body.style.transition = 'height 0.3s ease';

          body.offsetHeight; // force reflow
          body.style.height = fullHeight;

          var onEnd = function () {
            body.style.height = '';
            body.style.overflow = '';
            body.style.transition = '';
            body.removeEventListener('transitionend', onEnd);
          };
          body.addEventListener('transitionend', onEnd);
        } else {
          body.style.height = body.scrollHeight + 'px';
          body.style.overflow = 'hidden';
          body.style.transition = 'height 0.3s ease';

          body.offsetHeight; // force reflow
          body.style.height = '0';

          var onEnd = function () {
            if (section.classList.contains('collapsed')) {
              body.style.display = 'none';
            }
            body.style.height = '';
            body.style.overflow = '';
            body.style.transition = '';
            body.removeEventListener('transitionend', onEnd);
          };
          body.addEventListener('transitionend', onEnd);

          section.classList.add('collapsed');
        }
      });
    });
  }

  /* ---- Tab栏点击切换（tab-bar） ---- */
  function initTabBars() {
    document.querySelectorAll('.tab-bar').forEach(function (tabBar) {
      tabBar.querySelectorAll('.tab-item').forEach(function (tabItem) {
        tabItem.addEventListener('click', function () {
          tabBar.querySelectorAll('.tab-item').forEach(function (t) {
            t.classList.remove('active');
          });
          tabItem.classList.add('active');
        });
      });
    });
  }

  /* ---- 分栏布局字典项选择（dict-item） ---- */
  function initDictItems() {
    document.querySelectorAll('.dict-item').forEach(function (dictItem) {
      dictItem.style.cursor = 'pointer';
      dictItem.addEventListener('click', function () {
        var container = dictItem.parentElement;
        container.querySelectorAll('.dict-item').forEach(function (item) {
          item.classList.remove('active');
        });
        dictItem.classList.add('active');
      });
    });
  }

  /* ---- 表格搜索过滤 ---- */
  function initTableSearch() {
    // Find search forms: look for .search-filter or .filter-bar that contain a "查询" or search button
    var searchAreas = document.querySelectorAll('.search-filter, .filter-bar');
    searchAreas.forEach(function(area) {
      var searchBtn = area.querySelector('.filter-actions .btn-primary, .filter-actions .btn-success');
      var resetBtn = area.querySelector('.filter-actions .btn:not(.btn-primary):not(.btn-success)');
      var tableWrap = area.nextElementSibling;
      // Sometimes there's a card wrapper between filter and table
      if (tableWrap && !tableWrap.querySelector('table')) {
        tableWrap = tableWrap.nextElementSibling;
      }
      var table = tableWrap ? tableWrap.querySelector('table') : null;
      if (!table || !searchBtn) return;

      searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        var inputs = area.querySelectorAll('input[type="text"], input[type="date"], select');
        var rows = table.querySelectorAll('tbody tr');
        var hasFilter = false;
        
        rows.forEach(function(row) {
          var show = true;
          inputs.forEach(function(input) {
            var val = input.value.trim().toLowerCase();
            if (!val) return;
            hasFilter = true;
            // Search all cells in this row
            var cells = row.querySelectorAll('td');
            var found = false;
            cells.forEach(function(cell) {
              if (cell.textContent.toLowerCase().indexOf(val) !== -1) found = true;
            });
            if (!found) show = false;
          });
          row.style.display = show ? '' : 'none';
        });
        
        if (!hasFilter) {
          // No filter applied, show all
          rows.forEach(function(row) { row.style.display = ''; });
        }
        
        var visibleCount = table.querySelectorAll('tbody tr:not([style*="display: none"])').length;
        window.showToast && window.showToast('查询完成，共 ' + visibleCount + ' 条记录', 'success');
      });

      if (resetBtn) {
        resetBtn.addEventListener('click', function() {
          area.querySelectorAll('input[type="text"]').forEach(function(i) { i.value = ''; });
          area.querySelectorAll('select').forEach(function(s) { s.selectedIndex = 0; });
          area.querySelectorAll('input[type="date"]').forEach(function(d) { d.value = ''; });
          area.querySelectorAll('.form-switch input[type="checkbox"]').forEach(function(c) { c.checked = false; });
          table.querySelectorAll('tbody tr').forEach(function(row) { row.style.display = ''; });
          window.showToast && window.showToast('已重置筛选条件', 'info');
        });
      }
    });
  }

  /* ---- 分页点击 ---- */
  function initPagination() {
    document.querySelectorAll('.pagination').forEach(function(pager) {
      var pageBtns = pager.querySelectorAll('.page-btn:not(.disabled):not(.active)');
      pageBtns.forEach(function(btn) {
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', function() {
          // Toggle active state
          pager.querySelectorAll('.page-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          // Update page info text if exists
          var info = pager.querySelector('.page-info');
          if (info) {
            var pageNum = btn.textContent.replace(/[^\d]/g, '');
            if (pageNum) info.textContent = '第 ' + pageNum + ' 页 / 共 15 页';
          }
        });
      });
      // Also handle .page-btns a elements
      var pageLinks = pager.querySelectorAll('.page-btns .page-btn:not(.disabled)');
      pageLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          pager.querySelectorAll('.page-btns .page-btn').forEach(function(b) { b.classList.remove('active'); });
          link.classList.add('active');
        });
      });
    });
  }

  /* ---- 文件上传区点击选择 ---- */
  function initFileUpload() {
    document.querySelectorAll('.upload-area').forEach(function(area) {
      // Create hidden file input
      var fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.style.display = 'none';
      fileInput.multiple = true;
      area.appendChild(fileInput);

      area.style.cursor = 'pointer';
      area.addEventListener('click', function() {
        fileInput.click();
      });

      fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
          var names = [];
          for (var i = 0; i < fileInput.files.length; i++) {
            names.push(fileInput.files[i].name);
          }
          area.innerHTML = '<div class="upload-icon" style="color:var(--primary);">&#10004;</div><div class="upload-text" style="color:var(--primary);">' + names.join(', ') + '</div><div class="upload-hint">点击重新选择</div>';
          area.appendChild(fileInput);
        }
      });

      // Drag events
      area.addEventListener('dragover', function(e) { e.preventDefault(); area.style.borderColor = 'var(--primary)'; area.style.background = 'var(--primary-light, #e8f5ec)'; });
      area.addEventListener('dragleave', function() { area.style.borderColor = ''; area.style.background = ''; });
      area.addEventListener('drop', function(e) { e.preventDefault(); area.style.borderColor = ''; area.style.background = ''; });
    });
  }

  /* ---- 富文本编辑器 ---- */
  function initRichTextEditor() {
    document.querySelectorAll('.editor-toolbar').forEach(function(toolbar) {
      var editorArea = toolbar.nextElementSibling;
      if (!editorArea || !editorArea.classList.contains('editor-area')) return;
      
      toolbar.querySelectorAll('.toolbar-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          var cmd = btn.getAttribute('data-cmd') || '';
          if (!cmd) return;
          editorArea.focus();
          document.execCommand(cmd, false, null);
        });
      });
    });
  }

  /* ---- Tab栏切换过滤表格 ---- */
  function initTabBarFilter() {
    document.querySelectorAll('.tab-bar').forEach(function(tabBar) {
      var tabItems = tabBar.querySelectorAll('.tab-item');
      if (tabItems.length === 0) return;
      
      // Find the next table
      var parent = tabBar.parentElement;
      var tableWrap = parent ? parent.querySelector('.table-wrap') : null;
      var table = tableWrap ? tableWrap.querySelector('table') : null;
      if (!table) return;

      tabItems.forEach(function(tabItem) {
        tabItem.addEventListener('click', function() {
          tabItems.forEach(function(t) { t.classList.remove('active'); });
          tabItem.classList.add('active');
          
          var tabText = tabItem.textContent.trim().replace(/\d+/g, '').trim();
          var rows = table.querySelectorAll('tbody tr');
          var hasMatch = false;
          
          rows.forEach(function(row) {
            if (tabText === '全部' || tabText === '全部记录') {
              row.style.display = '';
              hasMatch = true;
            } else {
              // Check if any cell contains the tab text (e.g., "待审核", "已通过")
              var cells = row.querySelectorAll('td');
              var found = false;
              cells.forEach(function(cell) {
                if (cell.textContent.indexOf(tabText) !== -1) found = true;
              });
              row.style.display = found ? '' : 'none';
              if (found) hasMatch = true;
            }
          });
        });
      });
    });
  }

  /* ---- 统计卡片点击跳转 ---- */
  function initStatCardClick() {
    var cards = document.querySelectorAll('.stat-card');
    var cardMap = {
      '村民': { url: 'user/villager-list.html', title: '村民管理' },
      '事件': { url: 'event/event-list.html', title: '事件管理' },
      '待处理': { url: 'event/event-list.html', title: '事件管理' },
      '积分': { url: 'village/points-shop/points-manage.html?tab=audit', title: '积分审核' },
      '审核': { url: 'village/points-shop/points-manage.html?tab=audit', title: '积分审核' }
    };
    
    cards.forEach(function(card) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function() {
        var label = card.querySelector('.stat-label');
        if (!label) return;
        var text = label.textContent;
        for (var key in cardMap) {
          if (text.indexOf(key) !== -1) {
            if (window.parent && window.parent.openPage) {
              window.parent.openPage(cardMap[key].url, cardMap[key].title);
            }
            return;
          }
        }
      });
    });
  }

  /* ---- 权限保存 ---- */
  function initPermissionSave() {
    var permModal = document.getElementById('permModal');
    if (!permModal) return;
    var footer = permModal.querySelector('.modal-footer');
    if (!footer) return;
    // Add save button if not exists
    if (!footer.querySelector('.perm-save-btn')) {
      var saveBtn = document.createElement('button');
      saveBtn.className = 'btn btn-primary perm-save-btn';
      saveBtn.textContent = '保存权限';
      saveBtn.addEventListener('click', function() {
        window.closeModal('permModal');
        window.showToast('权限已保存', 'success');
      });
      footer.insertBefore(saveBtn, footer.firstChild);
    }
  }

  /* ---- 自动无障碍增强（全局，所有 admin 子页面受益）---- */
  function initA11yAuto() {
    // 1. 注入 theme-color（若缺失）
    if (!document.querySelector('meta[name="theme-color"]')) {
      var themeMeta = document.createElement('meta');
      themeMeta.setAttribute('name', 'theme-color');
      themeMeta.setAttribute('content', '#ffffff');
      document.head.appendChild(themeMeta);
    }

    // 2. 装饰性 iconify-icon 加 aria-hidden
    document.querySelectorAll('iconify-icon').forEach(function (ic) {
      if (!ic.getAttribute('aria-label') && !ic.getAttribute('aria-hidden')) {
        ic.setAttribute('aria-hidden', 'true');
      }
    });

    // 3. 装饰性 svg 加 aria-hidden（无 aria-label 的纯图标 svg）
    document.querySelectorAll('svg:not([aria-label]):not([aria-hidden])').forEach(function (sv) {
      // 仅当 svg 无文本子节点时视为装饰
      if (!sv.textContent || !sv.textContent.trim()) {
        sv.setAttribute('aria-hidden', 'true');
      }
    });

    // 4. 可点击的非按钮/链接元素加 role/tabindex/键盘支持
    document.querySelectorAll('[onclick]').forEach(function (el) {
      var tag = el.tagName;
      if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'SELECT') return;
      if (el.getAttribute('role')) return; // 已设置则跳过
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });
    });

    // 5. placeholder 规范化：未以 … 结尾的自动补 …（仅中文"请输入/请选择"类）
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(function (el) {
      var p = el.getAttribute('placeholder');
      if (!p) return;
      // 将三个半角点 ... 替换为 …
      if (p.indexOf('...') !== -1) {
        p = p.replace(/\.{3,}/g, '…');
      }
      // 若以"请输入/请选择"开头且未以 … 结尾，补 …
      if (/^(请输入|请选择|搜索)/.test(p) && !/[…\.]$/.test(p)) {
        p = p + '…';
      }
      if (p !== el.getAttribute('placeholder')) {
        el.setAttribute('placeholder', p);
      }
    });

    // 6. 表单 label 关联：label 紧邻 input/select/textarea 时，若 input 无 id 且 label 无 for，自动关联
    document.querySelectorAll('label').forEach(function (lbl) {
      if (lbl.getAttribute('for')) return;
      var next = lbl.nextElementSibling;
      // 处理 label 直接后跟 input 的情况
      if (next && (next.tagName === 'INPUT' || next.tagName === 'SELECT' || next.tagName === 'TEXTAREA')) {
        if (!next.id) {
          next.id = 'auto-field-' + Math.random().toString(36).slice(2, 9);
        }
        lbl.setAttribute('for', next.id);
      }
      // 处理 label 后跟容器（div.relative 等）内含 input 的情况
      if (next && next.tagName === 'DIV') {
        var innerInput = next.querySelector('input, select, textarea');
        if (innerInput && !innerInput.id) {
          innerInput.id = 'auto-field-' + Math.random().toString(36).slice(2, 9);
          lbl.setAttribute('for', innerInput.id);
        } else if (innerInput && innerInput.id) {
          lbl.setAttribute('for', innerInput.id);
        }
      }
    });

    // 7. input 补 autocomplete（若缺失且为常见类型）
    document.querySelectorAll('input:not([autocomplete])').forEach(function (inp) {
      var type = inp.getAttribute('type') || 'text';
      var name = (inp.getAttribute('name') || inp.id || '').toLowerCase();
      var ac = '';
      if (type === 'password') ac = name.indexOf('new') !== -1 || name.indexOf('confirm') !== -1 ? 'new-password' : 'current-password';
      else if (type === 'email') ac = 'email';
      else if (type === 'tel') ac = 'tel';
      else if (type === 'search' || name.indexOf('search') !== -1 || name.indexOf('keyword') !== -1) ac = 'off';
      else if (type === 'url') ac = 'url';
      else ac = 'off';
      inp.setAttribute('autocomplete', ac);
    });

    // 8. 数字 input 补 inputmode
    document.querySelectorAll('input[type="number"]').forEach(function (inp) {
      if (!inp.getAttribute('inputmode')) inp.setAttribute('inputmode', 'numeric');
    });

    // 9. 邮箱/英文编码 input 补 spellcheck=false
    document.querySelectorAll('input[type="email"], input[type="url"]').forEach(function (inp) {
      inp.setAttribute('spellcheck', 'false');
    });

    // 10. tab-item div 补 role=tab + aria-selected（若在 tablist 容器内）
    document.querySelectorAll('.tab-bar, [role="tablist"]').forEach(function (bar) {
      bar.querySelectorAll('.tab-item').forEach(function (tab) {
        if (tab.tagName !== 'BUTTON') {
          tab.setAttribute('role', 'tab');
          tab.setAttribute('tabindex', '0');
          tab.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tab.click(); }
          });
        }
        tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
      });
    });

    // 11. 纯图标按钮（无文本子节点，仅有图标）补 aria-label：优先取 title，否则取图标语义
    document.querySelectorAll('button').forEach(function (btn) {
      if (btn.getAttribute('aria-label')) return;
      var hasText = btn.textContent && btn.textContent.trim();
      if (hasText) return; // 有文本，图标视为装饰
      var title = btn.getAttribute('title');
      if (title) {
        btn.setAttribute('aria-label', title);
        return;
      }
      // 从 iconify-icon 的 icon 属性推断
      var ic = btn.querySelector('iconify-icon');
      if (ic) {
        var iconName = ic.getAttribute('icon') || '';
        var labelMap = {
          'edit': '编辑', 'delete': '删除', 'view': '查看', 'eye': '查看',
          'add': '新增', 'plus': '新增', 'search': '搜索', 'filter': '筛选',
          'close': '关闭', 'check': '确认', 'arrow-up': '向上', 'arrow-down': '向下',
          'arrow-left': '向左', 'arrow-right': '向右', 'zoom-in': '放大', 'zoom-out': '缩小',
          'refresh': '刷新', 'download': '下载', 'upload': '上传', 'export': '导出',
          'import': '导入', 'settings': '设置', 'more': '更多', 'expand': '展开',
          'collapse': '折叠', 'copy': '复制', 'save': '保存', 'reset': '重置',
          'lock': '锁定', 'unlock': '解锁', 'visibility': '显示/隐藏'
        };
        for (var key in labelMap) {
          if (iconName.indexOf(key) !== -1) {
            btn.setAttribute('aria-label', labelMap[key]);
            break;
          }
        }
      }
    });

    // 12. select-all checkbox 补 .select-all 类（initTableCheckboxes 已兼容，此处确保）
    document.querySelectorAll('th input[type="checkbox"]').forEach(function (cb) {
      if (!cb.classList.contains('select-all')) cb.classList.add('select-all');
    });

    // 13. 破坏性操作兜底：onclick 含 showToast('确认删除 / 删除 / 删除？') 的按钮升级为二次确认（仅当未用 showConfirm）
    document.querySelectorAll('button[onclick]').forEach(function (btn) {
      var oc = btn.getAttribute('onclick') || '';
      // 仅处理形如 showToast('xxx删除xxx', 'warning') 且无 showConfirm 的
      if (/showToast\(['"][^'"]*删/.test(oc) && oc.indexOf('showConfirm') === -1) {
        btn.setAttribute('data-confirm-delete', '1');
        btn.addEventListener('click', function (e) {
          // 已被原生 onclick 触发 toast，这里不再阻断；仅作为标记，供后续统一升级
        }, { once: true });
      }
    });

    // 14. 数值/日期等宽：表格中含日期、时间、纯数字、金额的 td 自动加 tabular-nums；
    //     同时给常见 KPI 数值选择器补 tabular-nums
    var _numRe = /^\s*([¥￥]?\s*-?\d[\d,]*(\.\d+)?\s*(%|元|岁|人|条|次|件|户|亩|分|天|小时|分钟|秒)?\s*|￥?\s*\d[\d,]*\.\d+\s*元?)\s*$/;
    var _dateRe = /^\s*\d{4}[-\/]\d{1,2}[-\/]\d{1,2}(\s+\d{1,2}:\d{2}(:\d{2})?)?\s*$/;
    var _timeRe = /^\s*\d{1,2}:\d{2}(:\d{2})?\s*$/;
    document.querySelectorAll('table tbody td').forEach(function (td) {
      if (td.classList.contains('tabular-nums') || td.classList.contains('tnum') || td.classList.contains('nums') || td.classList.contains('col-num')) return;
      // 跳过含子元素的单元格（按钮、标签等），仅处理纯文本/含单个文本节点
      var txt = (td.textContent || '').trim();
      if (!txt) return;
      if (td.querySelector('button, a, input, select, .tag, .badge, img')) return;
      if (_dateRe.test(txt) || _timeRe.test(txt) || _numRe.test(txt)) {
        td.classList.add('tabular-nums');
      }
    });
    // KPI / 统计数值
    document.querySelectorAll('.stat-value, .kpi-value, .kpi-num, .num-value, .count-num, .metric-value, .total-num, .affairs-meta, .todo-meta, .dv-info-value').forEach(function (n) {
      if (!n.classList.contains('tabular-nums') && !n.classList.contains('tnum')) {
        n.classList.add('tabular-nums');
      }
    });
  }

  /* ---- 筛选/分页状态同步到 URL（guidelines: 导航/状态）---- */
  function initFilterUrlSync() {
    // 仅对带 name 的筛选项生效；分页始终同步 page
    function buildQuery(filterArea) {
      var params = new URLSearchParams();
      if (filterArea) {
        filterArea.querySelectorAll('input[name], select[name]').forEach(function (el) {
          var n = el.getAttribute('name');
          var v;
          if (el.type === 'checkbox') v = el.checked ? '1' : '';
          else v = el.value;
          if (v !== '' && v != null) params.set(n, v);
          else params.delete(n);
        });
      }
      return params;
    }
    function applyQuery(filterArea) {
      var params = new URLSearchParams(window.location.search);
      if (!params.toString()) return false;
      var applied = false;
      if (filterArea) {
        filterArea.querySelectorAll('input[name], select[name]').forEach(function (el) {
          var n = el.getAttribute('name');
          if (params.has(n)) {
            var v = params.get(n);
            if (el.type === 'checkbox') el.checked = (v === '1');
            else el.value = v;
            applied = true;
          }
        });
      }
      return applied;
    }
    function saveToUrl(params) {
      var qs = params.toString();
      var newUrl = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
      history.replaceState(null, '', newUrl);
    }

    var filterArea = document.querySelector('.search-filter, .filter-bar, form[data-filter]');

    // 1. 还原筛选状态
    applyQuery(filterArea);

    // 2. 分页：还原 page 并同步点击
    var params = new URLSearchParams(window.location.search);
    var initialPage = params.get('page');
    document.querySelectorAll('.pagination').forEach(function (pager) {
      if (initialPage) {
        var target = pager.querySelector('.page-btn[data-page="' + initialPage + '"]');
        if (!target) {
          var numBtns = pager.querySelectorAll('.page-btn:not(.disabled)');
          numBtns.forEach(function (b) {
            if ((b.textContent || '').replace(/[^\d]/g, '') === initialPage) target = b;
          });
        }
        if (target) {
          pager.querySelectorAll('.page-btn').forEach(function (b) { b.classList.remove('active'); });
          target.classList.add('active');
        }
      }
      pager.addEventListener('click', function (e) {
        var btn = e.target.closest('.page-btn:not(.disabled)');
        if (!btn) return;
        var pageNum = btn.getAttribute('data-page') || (btn.textContent || '').replace(/[^\d]/g, '');
        if (!pageNum) return;
        var p = buildQuery(filterArea);
        if (pageNum && pageNum !== '1') p.set('page', pageNum); else p.delete('page');
        saveToUrl(p);
      });
    });

    // 3. 筛选区查询/重置后保存状态（事件委托，与 initTableSearch 叠加不冲突）
    if (filterArea) {
      var actions = filterArea.querySelector('.filter-actions') || filterArea;
      actions.addEventListener('click', function (e) {
        var btn = e.target.closest('button');
        if (!btn) return;
        // 查询 / 重置 均同步 URL
        var p = buildQuery(filterArea);
        var txt = (btn.textContent || '').trim();
        if (/重\s*置/.test(txt)) {
          // 重置：清空所有筛选参数，保留 page=1 或移除
          p = new URLSearchParams();
        }
        saveToUrl(p);
      });
    }
  }

  /* ---- 页面标题条注入（读取 body[data-page-title] → 注入南丰式 .page-header）----
     共存说明：page-enhancer.js 也会基于 <title> 注入 .pg-page-header。为避免出现两条标题条，
     本逻辑在注入 .page-header 前会移除已存在的 .pg-page-header，并复用其 id(_pg_page_header)
     以保证 page-enhancer 的工具条定位逻辑不受影响。当页面未携带 data-page-title 时不作任何处理。 */
  function initPageHeader() {
    var body = document.body;
    if (!body) return;

    var title = body.getAttribute('data-page-title');
    if (!title) return; // 仅当 body 携带 data-page-title 时才注入（其余页面交由 page-enhancer 处理）

    // 选取容器：优先 .admin-page / .content-wrapper，回退到 page-enhancer 的容器选择，最后 body
    var container =
      document.querySelector('.admin-page') ||
      document.querySelector('.content-wrapper') ||
      document.querySelector('.page-container') ||
      document.querySelector('.container') ||
      document.querySelector('main') ||
      document.querySelector('.main') ||
      body;

    // 幂等：容器若已有 .page-header 则跳过（多次运行不产生重复标题条）
    if (container.querySelector('.page-header')) return;

    var subtitle = body.getAttribute('data-page-subtitle') || '';
    var actionText = body.getAttribute('data-page-action-text');
    var actionOnclick = body.getAttribute('data-page-action-onclick');

    var header = document.createElement('div');
    header.className = 'page-header';
    header.id = '_pg_page_header'; // 复用 id，使 page-enhancer 识别为已有标题条而不重复注入

    var h2 = document.createElement('h2');
    h2.textContent = title;
    header.appendChild(h2);

    if (subtitle) {
      var p = document.createElement('p');
      p.className = 'text-muted';
      p.textContent = subtitle;
      header.appendChild(p);
    }

    // 可选增强：右侧主操作按钮（多数页面不设 data-page-action-text，本批仅注入标题/副标题）
    if (actionText) {
      var btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.type = 'button';
      btn.textContent = actionText;
      if (actionOnclick) btn.setAttribute('onclick', actionOnclick);
      btn.style.marginLeft = 'auto';
      header.appendChild(btn);
    }

    // 移除 page-enhancer 已注入的 .pg-page-header，避免双标题条
    var legacy = document.querySelector('.pg-page-header');
    if (legacy && legacy.parentNode) {
      legacy.parentNode.removeChild(legacy);
    }

    container.insertBefore(header, container.firstChild);
  }

  /* ---- 初始化 ---- */
  function init() {
    initSidebar();
    initNavMenu();
    highlightMenuItem();
    initModals();
    initTableCheckboxes();
    initDropdowns();
    initCollapsePanels();
    initCollapsibleSections();
    initTabBars();
    initDictItems();
    initTableSearch();
    initPagination();
    initFileUpload();
    initRichTextEditor();
    initTabBarFilter();
    initStatCardClick();
    initPermissionSave();
    initA11yAuto();
    initFilterUrlSync();
    initPageHeader();
  }

  // DOM加载后执行初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ---- 自动接入 PageEnhancer 组件（南丰式页面头部 + CRUD 工具条注入）----
     所有引用 admin.js 的旧页面自动接入新组件：独立打开页面同样生效；
     与主框架 iframe 的注入幂等（组件内部已做防重复处理）。 */
  function initPageEnhancer() {
    function boot() {
      if (typeof window.PageEnhancer === 'undefined') return;
      function run() {
        try { window.PageEnhancer.inject(document); } catch (e) {}
      }
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
      } else {
        run();
      }
    }
    if (typeof window.PageEnhancer !== 'undefined') { boot(); return; }
    // 动态加载同目录下的 page-enhancer.js（基于 admin.js 自身地址推导）
    var src = '';
    if (document.currentScript) src = document.currentScript.src || '';
    if (!src) {
      var s = document.querySelector('script[src$="admin.js"]');
      if (s) src = s.src || '';
    }
    var base = src.replace(/[^/]*$/, '');
    var script = document.createElement('script');
    script.src = base + 'page-enhancer.js';
    script.onload = boot;
    script.onerror = function () {}; // 组件缺失时静默降级，不影响页面原有功能
    document.head.appendChild(script);
  }
  initPageEnhancer();

})();
