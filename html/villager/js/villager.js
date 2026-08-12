/* ===== 村民端交互脚本 ===== */

// TabBar 切换
document.querySelectorAll('.tab-bar').forEach(function(bar) {
  var items = bar.querySelectorAll('.tab-item');
  items.forEach(function(item) {
    item.addEventListener('click', function() {
      items.forEach(function(i) { i.classList.remove('active'); });
      this.classList.add('active');
    });
  });
});

// Tab 按钮组切换
document.querySelectorAll('.tab-group').forEach(function(group) {
  var btns = group.querySelectorAll('.tab-btn');
  btns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      btns.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
    });
  });
});

// 通知公告滚动条自动轮播
(function() {
  var scrollEl = document.querySelector('.notice-scroll');
  if (!scrollEl) return;
  var textEl = scrollEl.querySelector('.notice-text');
  if (!textEl) return;
  // Clone text for seamless scrolling
  var clone = textEl.cloneNode(true);
  scrollEl.appendChild(clone);
  var offset = 0;
  var scrollWidth = textEl.offsetWidth;
  function animate() {
    offset -= 1;
    if (Math.abs(offset) >= scrollWidth) {
      offset = 0;
    }
    textEl.style.transform = 'translateX(' + offset + 'px)';
    clone.style.transform = 'translateX(' + offset + 'px)';
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();

// Banner 自动轮播
(function() {
  var banner = document.querySelector('.banner');
  if (!banner) return;
  var track = banner.querySelector('.banner-track');
  var dots = banner.querySelectorAll('.banner-dot');
  if (!track || dots.length === 0) return;
  var items = banner.querySelectorAll('.banner-item');
  var total = items.length;
  var current = 0;
  var autoTimer;

  function goTo(index) {
    current = index;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    dots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function next() {
    goTo((current + 1) % total);
  }

  // Auto play every 4 seconds
  autoTimer = setInterval(next, 4000);

  // Click dots
  dots.forEach(function(dot, i) {
    dot.addEventListener('click', function() {
      clearInterval(autoTimer);
      goTo(i);
      autoTimer = setInterval(next, 4000);
    });
  });

  // Touch swipe support
  var startX = 0;
  banner.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    clearInterval(autoTimer);
  });
  banner.addEventListener('touchend', function(e) {
    var diff = e.changedTouches[0].clientX - startX;
    if (diff > 50 && current > 0) {
      goTo(current - 1);
    } else if (diff < -50 && current < total - 1) {
      goTo(current + 1);
    }
    autoTimer = setInterval(next, 4000);
  });
})();

// Toast 显示/隐藏
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
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay show';
  overlay.innerHTML =
    '<div class="modal-box">' +
      '<div class="modal-title">' + title + '</div>' +
      '<div class="modal-body">' + content + '</div>' +
      '<div class="modal-footer">' +
        '<div class="modal-btn modal-cancel">取消</div>' +
        '<div class="modal-btn modal-confirm">确定</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);
  overlay.querySelector('.modal-cancel').addEventListener('click', function() {
    overlay.classList.remove('show');
    setTimeout(function() { overlay.remove(); }, 300);
    if (onCancel) onCancel();
  });
  overlay.querySelector('.modal-confirm').addEventListener('click', function() {
    overlay.classList.remove('show');
    setTimeout(function() { overlay.remove(); }, 300);
    if (onConfirm) onConfirm();
  });
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      overlay.classList.remove('show');
      setTimeout(function() { overlay.remove(); }, 300);
    }
  });
}

// 下拉刷新模拟
(function() {
  var pullEl = document.querySelector('.pull-refresh');
  if (!pullEl) return;
  var startY = 0;
  var content = document.querySelector('.page-content');
  if (!content) return;

  content.addEventListener('touchstart', function(e) {
    if (content.scrollTop <= 0) {
      startY = e.touches[0].clientY;
    }
  });

  content.addEventListener('touchmove', function(e) {
    if (content.scrollTop <= 0) {
      var diff = e.touches[0].clientY - startY;
      if (diff > 60) {
        pullEl.classList.add('show');
        pullEl.textContent = '释放刷新';
      } else if (diff > 0) {
        pullEl.classList.add('show');
        pullEl.textContent = '下拉刷新';
      }
    }
  });

  content.addEventListener('touchend', function() {
    if (pullEl.classList.contains('show')) {
      pullEl.textContent = '刷新中...';
      setTimeout(function() {
        pullEl.classList.remove('show');
        showToast('刷新成功');
      }, 1000);
    }
  });
})();

// 上拉加载更多模拟
(function() {
  var loadEl = document.querySelector('.load-more');
  if (!loadEl) return;
  var content = document.querySelector('.page-content');
  if (!content) return;

  content.addEventListener('scroll', function() {
    if (content.scrollTop + content.clientHeight >= content.scrollHeight - 50) {
      if (loadEl.dataset.loading === 'true') return;
      loadEl.dataset.loading = 'true';
      loadEl.textContent = '加载中...';
      setTimeout(function() {
        loadEl.textContent = '没有更多了';
        loadEl.dataset.loading = 'false';
      }, 1000);
    }
  });
})();

// 导航栏返回按钮
document.querySelectorAll('.nav-back').forEach(function(btn) {
  btn.addEventListener('click', function() {
    if (window.history.length > 1) {
      window.history.back();
    }
  });
});

// 表单提交模拟
document.querySelectorAll('.btn-primary').forEach(function(btn) {
  if (btn.type === 'submit' || btn.tagName === 'BUTTON') {
    btn.addEventListener('click', function(e) {
      if (this.tagName === 'A') return;
      e.preventDefault();
      var redirect = this.getAttribute('data-redirect');
      var text = this.textContent.trim();
      if (text === '确认兑换') {
        showModal('确认兑换', '确定使用积分兑换该商品吗？', function() {
          showToast('兑换成功');
          if (redirect) setTimeout(function() { location.href = redirect; }, 600);
        });
      } else if (text === '提交认证' || text === '提交申请' || text === '提交上报' || text === '提交') {
        showToast('提交成功');
        if (redirect) setTimeout(function() { location.href = redirect; }, 600);
      } else if (text === '发布') {
        showToast('发布成功');
        if (redirect) setTimeout(function() { location.href = redirect; }, 600);
      } else if (text === '保存') {
        showToast('保存成功');
        if (redirect) setTimeout(function() { location.href = redirect; }, 600);
      }
    });
  }
});

// 图片上传模拟
document.querySelectorAll('.upload-item').forEach(function(item) {
  item.addEventListener('click', function() {
    var area = this.closest('.upload-area');
    if (!area) return;
    var previews = area.querySelectorAll('.upload-preview');
    var hint = this.querySelector('.upload-hint');
    var maxCount = hint ? parseInt(hint.textContent.match(/\d+/)) : 9;
    if (previews.length >= maxCount) {
      showToast('最多上传' + maxCount + '张');
      return;
    }
    var preview = document.createElement('div');
    preview.className = 'upload-preview';
    preview.innerHTML = '&#10003;';
    preview.style.cursor = 'pointer';
    area.insertBefore(preview, this);
    preview.addEventListener('click', function() {
      if (confirm('确定删除该图片？')) {
        this.remove();
      }
    });
    showToast('图片已添加');
  });
});

// 发送评论模拟
(function() {
  var sendBtn = document.querySelector('.comment-input-bar .send-btn');
  if (!sendBtn) return;
  var input = sendBtn.closest('.comment-input-bar').querySelector('input');
  sendBtn.addEventListener('click', function() {
    if (!input.value.trim()) {
      showToast('请输入内容');
      return;
    }
    showToast('发送成功');
    var commentList = document.querySelector('.comment-list');
    if (commentList && input.value.trim()) {
      var now = new Date();
      var timeStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
      var newComment = document.createElement('div');
      newComment.className = 'comment-item';
      newComment.innerHTML = '<div class="comment-avatar">我</div><div class="comment-body"><div class="comment-name">我<span class="comment-time">' + timeStr + '</span></div><div class="comment-text">' + input.value.trim() + '</div></div>';
      commentList.insertBefore(newComment, commentList.firstChild);
    }
    input.value = '';
  });
})();

// Tab 筛选过滤
document.addEventListener('DOMContentLoaded', function() {
  var groups = document.querySelectorAll('.tab-group[data-filter-target], .tab-switch[data-filter-target], .tab-row[data-filter-target]');
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
});
