/* ============================================
 * Page Enhancer - 页面增强组件（南丰式页面头部 + CRUD 工具条注入）
 * ------------------------------------------------------------
 * 说明：为后台 iframe 子页面自动注入：
 *   1. 南丰式页面头部（主标题 + 副标题，对齐南丰蜜桔后台页面顶部）
 *   2. 通用 CRUD 工具条（搜索框 + 操作按钮 + 弹窗 + Toast）
 * 用法：
 *   <script src="js/page-enhancer.js"></script>
 *   在 iframe 加载完成后调用：PageEnhancer.inject(frame.contentDocument)
 * 配置：可覆盖 PageEnhancer.config 后调用 inject，例如：
 *   PageEnhancer.config.subtitle = '自定义副标题';
 *   PageEnhancer.inject(doc);
 * 依赖：无（原生 JS，样式基于 shared/tokens.css 与 shared/nanfeng.css）
 * ============================================ */
(function (global) {
  'use strict';

  var config = {
    subtitle: '乡村振兴数字平台 · 后台管理系统', // 页面副标题兜底文案（未命中映射时使用）
    // 按页面主标题（<title> 中 " - " 前的部分）匹配副标题，使每个页面的副标题贴合菜单与内容
    subtitleMap: {
      '工作台': '县乡村三级后台统一工作入口',
      '运营人员': '平台运营人员账号与权限管理',
      '乡村开通': '村庄开通申请受理与进度管理',
      '乡镇开通': '乡镇开通申请受理与进度管理',
      '开通审核': '乡村/乡镇开通申请审核处理',
      '党建管理': '党组织、党委会议、三会一课与班子管理',
      '乡镇信息': '乡镇网格、概况、名片、机构与信息管理',
      '产业数据': '乡域产业分类数据统计与分析',
      '党员管理': '党建信息发布与党员档案管理',
      '乡村概况': '村情基本信息维护与展示',
      '便民通讯录': '村级便民联系信息维护',
      '脱贫户管理': '脱贫户信息档案管理',
      '三务公开': '党务、村务、财务与四议两公开',
      '公告管理': '村务公告发布与状态管理',
      '村民说事': '村民议题发布与回复管理',
      '办事指南': '线上办事指南维护',
      '申请审核': '村民线上办事申请审核',
      '微网格': '村级微网格划分与管理',
      '矛盾调节': '矛盾纠纷登记与调解跟踪',
      '外出务工': '外出务工人员信息管理',
      '事件管理': '村级事件上报与处置',
      '随手拍管理': '村民与干部上报问题处置',
      '任务管理': '村干部工作任务分配与执行',
      '村民诉求': '诉求受理、处理与反馈',
      '工作日志': '村干部工作日志提交与审核',
      '设备管理': '乡村治理监控与物联设备管理',
      '产业管理': '村级特色产业信息管理',
      '房屋管理': '村级房屋信息档案管理',
      '土地管理': '村级土地资源信息管理',
      '积分管理': '村民积分体系与记录管理',
      '审核管理': '村级业务申请审核处理',
      '乡村旅游': '乡村旅游资源与项目展示',
      '农业认养': '农产品认养项目与订单管理',
      '表单应用': '村级业务表单设计与应用',
      '首页设计器': '幸福村 · 村级首页可视化设计',
      '村民管理': '村民基础信息管理',
      '村干部管理': '村干部人员信息管理',
      '组织架构': '组织层级架构管理',
      '角色权限': '角色与权限分配管理',
      '家庭户管理': '村民家庭户信息管理',
      '队组管理': '村级队组划分与管理',
      '注册审核': '用户注册申请审核处理',
      '内容配置': '大屏内容与展示配置',
      '数据源管理': '大屏数据源接入管理',
      '展示规则': '大屏展示规则配置',
      '数据字典': '系统数据字典维护',
      '操作日志': '系统操作日志查询',
      '系统参数': '系统参数配置管理',
      '网格巡查': '巡查计划与巡查记录管理',
      '积分商城': '积分商品与兑换管理',
      '待审核列表': '待审核的村务公开内容',
      '已发列表': '已发布的通知公告',
      '设备详情监控': '物联设备运行与监控详情',
      '开通审核详情': '乡村/乡镇开通申请审核详情',
      '开通审计编辑': '开通审计记录编辑',
      '运营人员新增/修改': '运营人员信息新增与编辑',
      '乡村开通申请新增': '填写申请开通的乡村信息',
      '乡镇开通申请新增': '填写申请开通的乡镇信息',
      '商品详情': '积分商品信息与上下架管理',
      '兑换单详情': '积分兑换订单审核与发放',
      '创建表单': '可视化设计业务表单',
      '事件详情': '村级事件处置详情'
    },
    skipPages: ['dashboard', 'designer'],         // 文件名包含这些关键字时跳过注入
    injectToolbar: true                           // 是否注入通用 CRUD 工具条
  };

  function isSkipPage(url) {
    var name = (url.split('/').pop() || '').toLowerCase();
    for (var i = 0; i < config.skipPages.length; i++) {
      if (name.indexOf(config.skipPages[i]) !== -1) return true;
    }
    return false;
  }

  function getWrapper(doc) {
    return doc.querySelector('.page-container') || doc.querySelector('.container') || doc.querySelector('main') || doc.querySelector('.main') || doc.body;
  }

  /* ---- 注入页面头部（南丰式标题区：主标题 + 副标题） ---- */
  function injectPageHeader(doc) {
    try {
      if (doc.getElementById('_pg_page_header')) return;
      // 页面自带标题区（.page-header / .dv-page-header）时不重复注入，避免双标题
      if (doc.querySelector('.page-header, .dv-page-header')) return;
      var t = (doc.title || '').trim();
      var title = (t.split(' - ')[0] || '').trim() || '页面管理';
      var header = doc.createElement('div');
      header.id = '_pg_page_header';
      header.className = 'pg-page-header';
      header.innerHTML =
        '<div class="pg-page-header-inner">' +
          '<h1 class="pg-page-title"></h1>' +
          '<p class="pg-page-subtitle"></p>' +
        '</div>';
      header.querySelector('.pg-page-title').textContent = title;
      header.querySelector('.pg-page-subtitle').textContent = config.subtitleMap[title] || config.subtitle;
      var wrapper = getWrapper(doc);
      wrapper.insertBefore(header, wrapper.firstChild);
      if (!doc.getElementById('_pg_header_css')) {
        var s = doc.createElement('style');
        s.id = '_pg_header_css';
        s.textContent =
          '.pg-page-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px;}' +
          '.pg-page-header-inner{display:flex;flex-direction:column;gap:4px;min-width:0;}' +
          '.pg-page-title{font-size:20px;font-weight:700;color:#1f2937;line-height:1.4;margin:0;}' +
          '.pg-page-subtitle{font-size:13px;color:#6b7280;margin:0;}';
        doc.head.appendChild(s);
      }
    } catch (e) {}
  }

  /* ---- 注入页面头部 + CRUD 工具条 ---- */
  function injectPageToolbar(doc) {
    try {
      if (!doc.body) return;
      var url = doc.location.pathname + doc.location.search;
      if (isSkipPage(url)) return;

      // 统一注入页面头部（主标题 + 副标题），对齐南丰页面顶部
      injectPageHeader(doc);

      // 未开启工具条，或页面自带 .toolbar / .action-bar（已有操作按钮区）时跳过通用工具条注入，避免多套工具条并存
      if (!config.injectToolbar || doc.body.getAttribute('data-no-pg-toolbar') !== null || doc.getElementById('_pg_toolbar') || doc.querySelector('.toolbar') || doc.querySelector('.action-bar')) return;

      var pageType = detectPageToolType(url);
      var wrapper = getWrapper(doc);

      // Inject CSS
      if (!doc.getElementById('_pg_toolbar_css')) {
        var style = doc.createElement('style');
        style.id = '_pg_toolbar_css';
        style.textContent = getToolbarCSS();
        doc.head.appendChild(style);
      }

      // Inject toolbar HTML（插入到页面头部之后）
      var toolbar = doc.createElement('div');
      toolbar.id = '_pg_toolbar';
      toolbar.className = 'pg-toolbar';
      toolbar.innerHTML = getToolbarHTML(pageType);
      var headerEl = doc.getElementById('_pg_page_header');
      wrapper.insertBefore(toolbar, headerEl ? headerEl.nextSibling : wrapper.firstChild);

      // Inject modal
      var modal = doc.createElement('div');
      modal.id = '_pg_modal';
      modal.className = 'pg-modal';
      modal.innerHTML =
        '<div class="pg-modal-overlay"></div>' +
        '<div class="pg-modal-dialog">' +
          '<div class="pg-modal-header"><h3 class="pg-modal-title">标题</h3><button class="pg-modal-close">&times;</button></div>' +
          '<div class="pg-modal-body"></div>' +
          '<div class="pg-modal-footer"></div>' +
        '</div>';
      doc.body.appendChild(modal);

      // Inject toast
      var toast = doc.createElement('div');
      toast.id = '_pg_toast';
      toast.className = 'pg-toast-container';
      toast.setAttribute('aria-live', 'polite');
      toast.setAttribute('aria-atomic', 'true');
      doc.body.appendChild(toast);

      // Bind events（绑定到 wrapper：按钮被迁入表头后仍在 wrapper 内，仍可响应）
      wrapper.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-act]');
        if (!btn) return;
        if (btn.closest('.pg-modal')) return; // 弹窗内按钮由各自逻辑处理
        handleToolbarAction(doc, btn.getAttribute('data-act'), btn);
      });
      modal.querySelector('.pg-modal-close').onclick = function () { modal.style.display = 'none'; };
      modal.querySelector('.pg-modal-overlay').onclick = function () { modal.style.display = 'none'; };

    } catch (e) {}
  }

  function detectPageToolType(url) {
    var n = (url.split('/').pop() || '').toLowerCase();
    if (n.indexOf('list') !== -1 || n.indexOf('audit') !== -1 || n.indexOf('report') !== -1 ||
        n.indexOf('appeal') !== -1 || n.indexOf('task') !== -1 || n.indexOf('journal') !== -1 ||
        n.indexOf('notice') !== -1 || n.indexOf('election') !== -1 || n.indexOf('activity') !== -1) return 'list-crud';
    if (n.indexOf('view') !== -1 || n.indexOf('check') !== -1 || n.indexOf('info') !== -1) return 'view';
    if (n.indexOf('config') !== -1 || n.indexOf('rule') !== -1 || n.indexOf('tree') !== -1 ||
        n.indexOf('permission') !== -1 || n.indexOf('dict') !== -1 || n.indexOf('log') !== -1) return 'config';
    return 'list-crud';
  }

  function getToolbarHTML(type) {
    var right = '';
    if (type === 'view') {
      right = '<button class="pg-btn pg-btn-default" data-act="export">导出</button><button class="pg-btn pg-btn-default" data-act="view">查看</button>';
    } else if (type === 'config') {
      right = '<button class="pg-btn pg-btn-primary" data-act="add">+ 新增</button><button class="pg-btn pg-btn-default" data-act="export">导出</button><button class="pg-btn pg-btn-default" data-act="import">导入</button>';
    } else {
      right = '<button class="pg-btn pg-btn-primary" data-act="add">+ 新增</button><button class="pg-btn pg-btn-success" data-act="audit">审核</button><button class="pg-btn pg-btn-warning" data-act="offline">下架</button><button class="pg-btn pg-btn-default" data-act="export">导出</button><button class="pg-btn pg-btn-default" data-act="import">导入</button>';
    }
    return '' +
      '<div class="pg-toolbar-inner">' +
        '<div class="pg-toolbar-search">' +
          '<div class="pg-search-input"><svg aria-hidden="true" class="pg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input type="text" placeholder="请输入关键字搜索…" class="pg-search-field" /></div>' +
          '<select class="pg-search-select"><option value="">全部状态</option><option value="1">启用</option><option value="0">禁用</option></select>' +
          '<button class="pg-btn pg-btn-primary" data-act="search">查询</button>' +
          '<button class="pg-btn pg-btn-default" data-act="reset">重置</button>' +
        '</div>' +
        '<div class="pg-toolbar-actions">' + right + '</div>' +
      '</div>';
  }

  function handleToolbarAction(doc, act, btn) {
    var modal = doc.getElementById('_pg_modal');
    var toast = doc.getElementById('_pg_toast');
    function showToast(msg, type) {
      var item = doc.createElement('div');
      item.className = 'pg-toast pg-toast-' + (type || 'info');
      item.textContent = msg;
      toast.appendChild(item);
      setTimeout(function () { item.classList.add('pg-toast-hiding'); setTimeout(function () { item.remove(); }, 300); }, 2000);
    }
    function openModal(title, body, footer) {
      modal.querySelector('.pg-modal-title').textContent = title;
      modal.querySelector('.pg-modal-body').innerHTML = body;
      modal.querySelector('.pg-modal-footer').innerHTML = footer;
      modal.style.display = 'flex';
      modal.querySelectorAll('.pg-modal-footer [data-act="cancel-modal"]').forEach(function (b) { b.onclick = function () { modal.style.display = 'none'; }; });
      modal.querySelectorAll('.pg-modal-footer [data-act="save-modal"]').forEach(function (b) { b.onclick = function () { modal.style.display = 'none'; showToast('操作成功', 'success'); }; });
    }
    switch (act) {
      case 'add': openModal('新增', getFormHTML(), '<button class="pg-btn pg-btn-default" data-act="cancel-modal">取消</button><button class="pg-btn pg-btn-primary" data-act="save-modal">保存</button>'); break;
      case 'audit': openModal('审核', getAuditHTML(), '<button class="pg-btn pg-btn-default" data-act="cancel-modal">取消</button><button class="pg-btn pg-btn-success" data-act="save-modal">通过</button><button class="pg-btn pg-btn-danger" data-act="save-modal">驳回</button>'); break;
      case 'export': showToast('导出成功', 'success'); break;
      case 'import': openModal('导入数据', getImportHTML(), '<button class="pg-btn pg-btn-default" data-act="cancel-modal">取消</button><button class="pg-btn pg-btn-primary" data-act="save-modal">确认导入</button>'); break;
      case 'offline': if (confirm('确定要下架选中的记录吗？')) showToast('下架成功', 'success'); break;
      case 'view': openModal('查看详情', getViewHTML(), '<button class="pg-btn pg-btn-default" data-act="cancel-modal">关闭</button>'); break;
      case 'search': showToast('查询成功', 'success'); break;
      case 'reset': var input = doc.querySelector('.pg-search-field'), sel = doc.querySelector('.pg-search-select'); if (input) input.value = ''; if (sel) sel.value = ''; showToast('已重置', 'info'); break;
    }
  }

  function getFormHTML() {
    return '<div class="pg-form">' +
      '<div class="pg-form-row"><label>名称</label><input type="text" placeholder="请输入名称…" /></div>' +
      '<div class="pg-form-row"><label>编号</label><input type="text" placeholder="请输入编号…" /></div>' +
      '<div class="pg-form-row"><label>类型</label><select><option>常规事项</option><option>紧急事项</option></select></div>' +
      '<div class="pg-form-row"><label>状态</label><select><option>启用</option><option>禁用</option></select></div>' +
      '<div class="pg-form-row"><label>备注</label><textarea rows="3" placeholder="请输入备注…"></textarea></div>' +
    '</div>';
  }
  function getAuditHTML() {
    return '<div class="pg-form">' +
      '<div class="pg-form-row"><label>审核结果</label><select><option>通过</option><option>驳回</option></select></div>' +
      '<div class="pg-form-row"><label>审核意见</label><textarea rows="4" placeholder="请输入审核意见…"></textarea></div>' +
      '<div class="pg-form-row"><label>审核人</label><input type="text" value="当前管理员" readonly /></div>' +
    '</div>';
  }
  function getViewHTML() {
    return '<div class="pg-view">' +
      '<div class="pg-view-row"><span>编号</span><b>XJ2026080901</b></div>' +
      '<div class="pg-view-row"><span>名称</span><b>幸福村村民王建国</b></div>' +
      '<div class="pg-view-row"><span>类型</span><b>常规事项</b></div>' +
      '<div class="pg-view-row"><span>状态</span><b style="color:var(--color-success)">启用</b></div>' +
      '<div class="pg-view-row"><span>创建时间</span><b>2026-08-09 10:30:00</b></div>' +
      '<div class="pg-view-row"><span>更新时间</span><b>2026-08-09 15:22:00</b></div>' +
      '<div class="pg-view-row"><span>备注</span><b>记录由村级管理员录入，数据已归档。</b></div>' +
    '</div>';
  }
  function getImportHTML() {
    return '<div class="pg-import">' +
      '<div class="pg-import-area">' +
        '<svg aria-hidden="true" class="pg-icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
        '<p>点击或拖拽文件到此区域上传</p>' +
        '<span>支持 .xlsx、.xls、.csv 格式，单文件不超过 10MB</span>' +
      '</div>' +
      '<div class="pg-form-row"><label>模板</label><a href="#" style="color:var(--color-primary-600)">下载导入模板</a></div>' +
    '</div>';
  }

  function getToolbarCSS() {
    return [
      '.pg-toolbar{background:#fff;border:1px solid #eef0f3;border-radius:12px;padding:12px 20px;margin-bottom:16px;box-shadow:0 1px 2px rgba(0,0,0,0.04);}',
      '.pg-toolbar-inner{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;}',
      '.pg-toolbar-search{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}',
      '.pg-search-input{display:flex;align-items:center;background:#fff;border:1px solid #d1d5db;border-radius:8px;padding:0 10px;height:36px;min-width:240px;transition:border-color .2s,box-shadow .2s;}',
      '.pg-search-input:focus-within{border-color:var(--color-primary-500);box-shadow:0 0 0 3px rgba(22,163,74,0.15);}',
      '.pg-search-input .pg-icon{width:16px;height:16px;color:var(--color-neutral-400);margin-right:6px;flex-shrink:0;}',
      '.pg-search-field{border:none;outline:none;background:transparent;font-size:13px;color:var(--color-neutral-800);width:100%;}',
      '.pg-search-field:focus-visible{outline:2px solid var(--color-primary-500);outline-offset:2px;}',
      '.pg-search-field::placeholder{color:var(--color-neutral-400);}',
      '.pg-search-select{height:36px;border:1px solid #d1d5db;border-radius:8px;padding:0 10px;font-size:13px;color:var(--color-neutral-600);background:#fff;transition:border-color .2s,box-shadow .2s;}',
      '.pg-search-select:focus{border-color:var(--color-primary-500);box-shadow:0 0 0 3px rgba(22,163,74,0.15);outline:none;}',
      '.pg-toolbar-actions{display:flex;gap:8px;align-items:center;}',
      '.pg-btn{display:inline-flex;align-items:center;justify-content:center;height:36px;padding:0 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;border:1px solid transparent;transition:background-color .15s ease, border-color .15s ease, color .15s ease;white-space:nowrap;}',
      '.pg-btn-primary{background:var(--color-primary-500);color:#fff;border-color:var(--color-primary-500);}',
      '.pg-btn-primary:hover{background:var(--color-primary-600);}',
      '.pg-btn-default{background:#fff;color:var(--color-neutral-700);border-color:var(--color-neutral-200);}',
      '.pg-btn-default:hover{background:var(--color-neutral-100);border-color:var(--color-neutral-300);color:var(--color-neutral-800);}',
      '.pg-btn-success{background:var(--color-success);color:#fff;border-color:var(--color-success);}',
      '.pg-btn-success:hover{background:var(--color-success-dark);}',
      '.pg-btn-warning{background:var(--color-warning);color:#fff;border-color:var(--color-warning);}',
      '.pg-btn-warning:hover{background:var(--color-warning-dark);}',
      '.pg-btn-danger{background:var(--color-error);color:#fff;border-color:var(--color-error);}',
      '.pg-btn-danger:hover{background:var(--color-error-dark);}',
      '.pg-modal{display:none;position:fixed;inset:0;z-index:var(--z-modal);justify-content:center;align-items:center;}',
      '.pg-modal-overlay{position:absolute;inset:0;background:rgba(28,25,23,0.5);backdrop-filter:blur(2px);}',
      '.pg-modal-dialog{position:relative;background:#fff;border:1px solid #eef0f3;border-radius:12px;width:480px;max-width:92vw;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:var(--shadow-xl);animation:pgModalIn .24s var(--ease-in-out);}',
      '.pg-modal-header{position:relative;display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid var(--color-neutral-200);}',
      '.pg-modal-header::before{display:none;}',
      '.pg-modal-title{margin:0;padding-left:0;font-size:16px;font-weight:600;color:var(--color-neutral-900);}',
      '.pg-modal-close{flex:none;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;border:none;background:none;font-size:20px;line-height:1;color:var(--color-neutral-400);cursor:pointer;border-radius:var(--radius-sm);transition:background-color .15s ease,color .15s ease;}',
      '.pg-modal-close:hover{background:var(--color-neutral-100);color:var(--color-neutral-800);}',
      '.pg-modal-body{padding:20px 24px 24px;overflow-y:auto;flex:1;overscroll-behavior:contain;}',
      '.pg-modal-footer{display:flex;justify-content:flex-end;gap:10px;padding:14px 24px;border-top:1px solid var(--color-neutral-200);background:var(--color-neutral-50);}',
      '.pg-form{display:flex;flex-direction:column;gap:14px;}',
      '.pg-form-row{display:flex;flex-direction:column;gap:5px;}',
      '.pg-form-row label{font-size:13px;color:var(--color-neutral-600);font-weight:500;}',
      '.pg-form-row input,.pg-form-row select,.pg-form-row textarea{border:1px solid var(--color-neutral-200);border-radius:8px;padding:8px 12px;font-size:13px;background:#fff;outline:none;transition:border-color .2s;}',
      '.pg-form-row input:focus,.pg-form-row select:focus,.pg-form-row textarea:focus{border-color:var(--color-primary-500);}',
      '.pg-form-row input:focus-visible,.pg-form-row select:focus-visible,.pg-form-row textarea:focus-visible{outline:2px solid var(--color-primary-500);outline-offset:2px;}',
      '.pg-form-row textarea{resize:vertical;min-height:72px;}',
      '.pg-view{display:flex;flex-direction:column;gap:12px;}',
      '.pg-view-row{display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:1px solid var(--color-neutral-100);}',
      '.pg-view-row span{color:var(--color-neutral-400);font-size:13px;}',
      '.pg-view-row b{color:var(--color-neutral-800);font-weight:500;font-size:13px;}',
      '.pg-import{display:flex;flex-direction:column;gap:16px;}',
      '.pg-import-area{border:2px dashed var(--color-neutral-300);border-radius:8px;padding:40px 20px;text-align:center;color:var(--color-neutral-400);cursor:pointer;transition:border-color .2s;}',
      '.pg-import-area:hover{border-color:var(--color-primary-500);color:var(--color-primary-600);}',
      '.pg-import-area .pg-icon-lg{width:48px;height:48px;margin:0 auto 12px;color:var(--color-neutral-300);}',
      '.pg-import-area p{font-size:14px;margin:0 0 4px;color:var(--color-neutral-600);}',
      '.pg-import-area span{font-size:12px;}',
      '.pg-toast-container{position:fixed;top:20px;right:20px;display:flex;flex-direction:column;gap:8px;z-index:100000;}',
      '.pg-toast{padding:10px 18px;border-radius:6px;color:#fff;font-size:13px;box-shadow:0 4px 16px rgba(0,0,0,0.12);animation:pgToastIn .3s ease;}',
      '.pg-toast-success{background:var(--color-success);}', '.pg-toast-info{background:var(--color-primary-500);}', '.pg-toast-warning{background:var(--color-warning);}', '.pg-toast-error{background:var(--color-error);}',
      '.pg-toast-hiding{animation:pgToastOut .3s ease forwards;}',
      '@keyframes pgModalIn{from{opacity:0;transform:translateY(-16px) scale(.98);}to{opacity:1;transform:translateY(0) scale(1);}}',
      '@keyframes pgToastIn{from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}}',
      '@keyframes pgToastOut{from{opacity:1;transform:translateX(0);}to{opacity:0;transform:translateX(40px);}}'
    ].join('');
  }

  /* ---- 数据表格增强：南丰列表名称 + mock 数据补齐(≥15) + 每页10条真实分页 ---- */
  var NAMES_POOL = ['王建国', '李秀兰', '张明远', '刘桂芳', '陈志远', '王丽', '赵国强', '孙丽华', '周建军', '吴秀英', '郑海燕', '冯志刚', '褚桂兰', '蒋国栋', '沈丽娟', '韩文明', '杨春梅', '朱建军', '秦桂芳', '尤志强', '何桂芳', '罗建国', '高秀兰', '林志强', '徐美华', '黄志明', '胡桂英'];

  function getPageTitle(doc) {
    var h = doc.querySelector('.pg-page-title');
    if (h && h.textContent && h.textContent.trim()) return h.textContent.trim();
    var hh = doc.querySelector('.page-header h2');
    if (hh && hh.textContent && hh.textContent.trim()) return hh.textContent.trim();
    var t = (doc.title || '').trim();
    return (t.split(' - ')[0] || '').trim() || '数据';
  }

  function bumpNumber(text, step) {
    return text.replace(/(\d+)$/, function (m) { return String(parseInt(m, 10) + step).padStart(m.length, '0'); });
  }
  function bumpDate(text, days) {
    return text.replace(/(20\d{2})-(\d{2})-(\d{2})/, function (m, y, mo, d) {
      var dt = new Date(+y, +mo - 1, +d + days);
      return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
    });
  }

  /* 注入南丰式"列表名称"标题（如：村民管理 → 村民列表）
     并将页面级操作工具栏（.toolbar/.action-bar）移入表头，与标题同行右对齐 */
  function injectTableTitle(container, table, pageTitle, doc) {
    if (container.querySelector('.table-title')) return;
    if (!table) return;
    var name = pageTitle.replace(/管理$/, '');
    if (name.indexOf('列表') === -1) name = name + '列表';
    var h3 = doc.createElement('h3');
    h3.className = 'table-title';
    h3.textContent = name;
    var bar = findPageActionBar(doc, container);
    if (bar) {
      var header = doc.createElement('div');
      header.className = 'table-actions-header';
      container.insertBefore(header, table);
      header.appendChild(h3);
      header.appendChild(bar);
    } else {
      container.insertBefore(h3, table);
    }
  }

  /* 查找页面级操作工具栏（位于表格卡片之外、尚未迁移的 .toolbar/.action-bar） */
  function findPageActionBar(doc, container) {
    var bars = doc.querySelectorAll('.toolbar, .action-bar, .pg-toolbar-actions');
    for (var i = 0; i < bars.length; i++) {
      var b = bars[i];
      if (b.closest && b.closest('.table-actions-header')) continue; // 已迁移，跳过
      if (b.closest && b.closest('.modal-overlay')) continue;        // 弹窗内工具栏不计
      if (container.contains(b)) continue;                           // 表格内部不计
      return b;
    }
    return null;
  }

  /* mock 数据补齐：不足 minRows 时以首行为模板克隆生成补充行 */
  function ensureMinRows(tbody, minRows) {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
    var real = rows.filter(function (r) { return r.querySelector('td'); });
    if (real.length >= minRows) return;
    var tpl = real[0];
    if (!tpl) return;
    var need = minRows - real.length;
    var nameIdx = 0;
    var famPool = [];
    real.forEach(function (r) {
      var f = r.getAttribute('data-family');
      if (f && famPool.indexOf(f) === -1) famPool.push(f);
    });
    for (var k = 0; k < need; k++) {
      var row = tpl.cloneNode(true);
      ['data-id', 'data-no', 'data-code', 'data-name'].forEach(function (attr) {
        var v = row.getAttribute(attr);
        if (v) row.setAttribute(attr, v + '-' + (k + 1));
      });
      // 归属类字段轮换，避免补充行集中到同一家庭
      if (famPool.length) row.setAttribute('data-family', famPool[k % famPool.length]);
      var tds = row.querySelectorAll('td');
      if (tds.length) {
        // 首列编号递增
        tds[0].textContent = bumpNumber(tds[0].textContent, k + 1);
      }
      // 纯文本姓名类单元格轮换
      for (var i = 0; i < tds.length; i++) {
        var td = tds[i];
        if (td.querySelector('button, a, input, select, .tag, .badge, img, span')) continue;
        if (i === 0 || i === tds.length - 1) continue;
        var txt = (td.textContent || '').trim();
        if (!txt) continue;
        if (/^[\u4e00-\u9fa5]{2,4}$/.test(txt) && NAMES_POOL.indexOf(txt) !== -1) {
          td.textContent = NAMES_POOL[(nameIdx++) % NAMES_POOL.length];
        }
      }
      // 标题类长文本单元格差异化，避免克隆行标题完全重复（如"村口垃圾堆积(2)"）
      for (var j = 0; j < tds.length; j++) {
        var td2 = tds[j];
        if (td2.querySelector('button, a, input, select, .tag, .badge, img, span')) continue;
        if (j === 0 || j === tds.length - 1) continue;
        var txt2 = (td2.textContent || '').trim();
        if (!txt2) continue;
        if (/^[\u4e00-\u9fa5]{5,}$/.test(txt2) && NAMES_POOL.indexOf(txt2) === -1) {
          td2.textContent = txt2 + '(' + (k + 2) + ')';
        }
      }
      // 时间字段递增
      Array.prototype.forEach.call(tds, function (td) {
        if (td.querySelector('button, a, input, select, .tag, .badge, img, span')) return;
        if (/20\d{2}-\d{2}-\d{2}/.test(td.textContent)) {
          td.textContent = bumpDate(td.textContent, k + 1);
        }
      });
      tbody.appendChild(row);
    }
  }

  /* 为表格启用"每页10条"的真实分页（南丰式分页控件） */
  function ensurePagination(doc, container, table, tbody) {
    var pager = container.querySelector('.pagination');
    if (!pager) {
      pager = doc.createElement('div');
      pager.className = 'pagination pg-pager';
      if (table.parentNode) table.parentNode.insertBefore(pager, table.nextSibling);
    } else {
      pager.classList.add('pg-pager');
    }
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
    var pageSize = 10;
    var currentPage = 1;

    pager.innerHTML =
      '<span class="page-total">显示 <b class="pg-page-range">1-10</b> 条，共 <b class="pg-page-count">' + rows.length + '</b> 条</span>' +
      '<select class="page-size-select" aria-label="每页条数">' +
        '<option value="5">5条/页</option><option value="10" selected>10条/页</option>' +
        '<option value="15">15条/页</option><option value="20">20条/页</option>' +
      '</select>' +
      '<div class="page-btns">' +
        '<button type="button" class="page-btn pg-prev">&laquo; 上一页</button>' +
        '<span class="pg-page-nums"></span>' +
        '<button type="button" class="page-btn pg-next">下一页 &raquo;</button>' +
      '</div>';

    function render() {
      // 支持客户端筛选：带 .pg-filtered 的行（被筛选隐藏）不参与分页
      var visible = rows.filter(function (r) { return !r.classList.contains('pg-filtered'); });
      var total = visible.length;
      var totalPages = Math.max(1, Math.ceil(total / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;
      var start = (currentPage - 1) * pageSize;
      rows.forEach(function (r) { r.style.display = 'none'; });
      for (var i = start; i < Math.min(start + pageSize, total); i++) {
        visible[i].style.display = '';
      }
      var rangeEl = pager.querySelector('.pg-page-range');
      if (rangeEl) rangeEl.textContent = total === 0 ? '0-0' : (start + 1) + '-' + Math.min(start + pageSize, total);
      var countEl = pager.querySelector('.pg-page-count');
      if (countEl) countEl.textContent = total;
      var numsEl = pager.querySelector('.pg-page-nums');
      if (numsEl) {
        var html = '';
        for (var i = 1; i <= totalPages; i++) {
          html += '<button type="button" class="page-btn' + (i === currentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
        }
        numsEl.innerHTML = html;
        Array.prototype.forEach.call(numsEl.querySelectorAll('.page-btn'), function (b) {
          b.addEventListener('click', function () {
            currentPage = parseInt(b.getAttribute('data-page'), 10);
            render();
          });
        });
      }
      var prev = pager.querySelector('.pg-prev');
      var next = pager.querySelector('.pg-next');
      if (prev) prev.onclick = function () { if (currentPage > 1) { currentPage--; render(); } };
      if (next) next.onclick = function () { if (currentPage < totalPages) { currentPage++; render(); } };
    }

    pager.querySelector('.page-size-select').addEventListener('change', function () {
      pageSize = parseInt(this.value, 10);
      currentPage = 1;
      render();
    });

    pager._pgRender = render; // 暴露给页面筛选逻辑，筛选后调用以重绘分页
    render();
  }

  /* 遍历页面中所有数据列表表格并增强 */
  function enhanceDataTable(doc) {
    try {
      if (doc.getElementById('_pg_table_enhanced')) return;
      var marker = doc.createElement('meta');
      marker.id = '_pg_table_enhanced';
      doc.head.appendChild(marker);

      if (isSkipPage(doc.location ? doc.location.pathname + doc.location.search : '')) return;

      var pageTitle = getPageTitle(doc);
      var tables = doc.querySelectorAll('table');
      Array.prototype.forEach.call(tables, function (table) {
        try {
          if (table.classList.contains('config-table')) return;
          var tbody = table.querySelector('tbody');
          if (!tbody) return;
          var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
          var realRows = rows.filter(function (r) { return r.querySelector('td'); });
          if (realRows.length < 2) return;
          if (!table.querySelector('th')) return;
          var colCount = realRows[0].querySelectorAll('td').length;
          if (colCount < 3) return;

          var container = table.closest('.table-wrap') || table.closest('.card') || table.parentNode;
          if (!container) return;

          injectTableTitle(container, table, pageTitle, doc);
          ensureMinRows(tbody, 15);
          ensurePagination(doc, container, table, tbody);
        } catch (e) {}
      });

      // 隐藏未被增强的旧分页控件，避免同一表格出现两套分页 UI
      // （跳过含 config-table 表格的容器：config.html 等页面自带分页逻辑，勿误隐藏）
      Array.prototype.forEach.call(doc.querySelectorAll('.pagination:not(.pg-pager)'), function (old) {
        var host = old.parentElement;
        if (host && host.querySelector('table.config-table')) return;
        old.style.display = 'none';
      });
    } catch (e) {}
  }

  /* ---- 暴露 API ---- */
  global.PageEnhancer = {
    config: config,
    inject: function (doc) {
      if (!doc || !doc.body) return;
      injectPageToolbar(doc);
      enhanceDataTable(doc);
    }
  };
})(window);
