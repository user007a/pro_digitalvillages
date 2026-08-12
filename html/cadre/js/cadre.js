/* ========================================
   村干部端 - 交互脚本
   ======================================== */

// TabBar 切换（4个Tab：工作台/巡查/通知/我的）
function initTabBar() {
  var tabs = document.querySelectorAll('.tab-bar .tab-item');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');
    });
  });
}

// Tab 按钮组切换
function initTabSwitch() {
  var groups = document.querySelectorAll('.tab-switch');
  groups.forEach(function(group) {
    var btns = group.querySelectorAll('.tab-btn');
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        btns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        // 触发自定义事件用于切换面板
        var panels = document.querySelectorAll(this.getAttribute('data-target') || '.tab-panel');
        var index = Array.prototype.indexOf.call(btns, this);
        panels.forEach(function(p, i) {
          if (p.parentElement) {
            p.style.display = i === index ? '' : 'none';
          }
        });
      });
    });
  });
}

// Tab行切换（可滚动）
function initTabRow() {
  var rows = document.querySelectorAll('.tab-row');
  rows.forEach(function(row) {
    var btns = row.querySelectorAll('.tab-btn');
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        btns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
      });
    });
  });
}

// Toast 显示
function showToast(msg, duration) {
  duration = duration || 2000;
  var existing = document.querySelector('.toast');
  if (existing) existing.remove();
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('aria-live', 'polite');
  toast.setAttribute('aria-atomic', 'true');
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function() { toast.classList.add('show'); }, 10);
  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() { toast.remove(); }, 300);
  }, duration);
}

// 弹窗确认/取消
function showModal(title, content, onConfirm, onCancel) {
  var mask = document.createElement('div');
  mask.className = 'modal-mask';
  mask.innerHTML =
    '<div class="modal-box">' +
      '<div class="modal-header">' + title + '</div>' +
      '<div class="modal-body">' + content + '</div>' +
      '<div class="modal-footer">' +
        '<div class="modal-btn" id="modalCancel">取消</div>' +
        '<div class="modal-btn" id="modalConfirm">确定</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(mask);
  setTimeout(function() { mask.classList.add('show'); }, 10);

  mask.querySelector('#modalCancel').addEventListener('click', function() {
    mask.classList.remove('show');
    setTimeout(function() { mask.remove(); }, 300);
    if (onCancel) onCancel();
  });
  mask.querySelector('#modalConfirm').addEventListener('click', function() {
    mask.classList.remove('show');
    setTimeout(function() { mask.remove(); }, 300);
    if (onConfirm) onConfirm();
  });
}

// 信息弹窗（单按钮：知道了）
function showInfoModal(title, content) {
  var mask = document.createElement('div');
  mask.className = 'modal-mask';
  mask.innerHTML =
    '<div class="modal-box">' +
      '<div class="modal-header">' + title + '</div>' +
      '<div class="modal-body">' + content + '</div>' +
      '<div class="modal-footer">' +
        '<div class="modal-btn" id="modalOk" style="width:100%;border-left:none;">知道了</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(mask);
  setTimeout(function() { mask.classList.add('show'); }, 10);
  mask.querySelector('#modalOk').addEventListener('click', function() {
    mask.classList.remove('show');
    setTimeout(function() { mask.remove(); }, 300);
  });
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  initTabBar();
  initTabSwitch();
  initTabRow();
  initTabFilter();
  initFormValidate();
});

// Tab 筛选过滤
function initTabFilter() {
  var groups = document.querySelectorAll('.tab-switch[data-filter-target], .tab-row[data-filter-target], .tab-group[data-filter-target]');
  groups.forEach(function(group) {
    var btns = group.querySelectorAll('.tab-btn');
    var target = group.getAttribute('data-filter-target');
    var items = document.querySelectorAll(target);
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        btns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        var filter = this.getAttribute('data-filter') || '';
        items.forEach(function(item) {
          if (!filter || filter === 'all' || item.getAttribute('data-status') === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  });
}

// 表单验证
function initFormValidate() {
  document.querySelectorAll('form[data-validate]').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('[required]').forEach(function(field) {
        if (!field.value.trim()) {
          field.style.borderColor = '#EF4444';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });
      if (valid) showToast('提交成功');
      else showToast('请填写必填项');
    });
  });
}
