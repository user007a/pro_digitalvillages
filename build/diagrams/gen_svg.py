# -*- coding: utf-8 -*-
"""
Generate architecture / flow / ER diagrams for the SRS document.
Style: clean, minimal, limited palette, light backgrounds, readable Chinese.
"""
import os

OUT = os.path.dirname(os.path.abspath(__file__))
os.makedirs(OUT, exist_ok=True)

# ===== palette (minimal, soft) =====
P = {
    "primary": "#2563EB",      # blue-600
    "primaryLight": "#DBEAFE", # blue-100
    "secondary": "#059669",    # emerald-600
    "secondaryLight": "#D1FAE5",
    "accent": "#D97706",       # amber-600 (decision / warning)
    "accentLight": "#FEF3C7",
    "slate900": "#0F172A",
    "slate700": "#334155",
    "slate600": "#475569",
    "slate500": "#64748B",
    "slate300": "#CBD5E1",
    "slate200": "#E2E8F0",
    "slate100": "#F1F5F9",
    "slate50": "#F8FAFC",
    "white": "#FFFFFF",
}

FONT = "'Microsoft YaHei','PingFang SC','Hiragino Sans GB','Microsoft JhengHei',sans-serif"

STYLE = (
    "<style>"
    "text{font-family:%s;fill:%s;}"
    ".title{font-size:20px;font-weight:700;fill:%s;}"
    ".subtitle{font-size:12px;font-weight:500;fill:%s;}"
    ".node-title{font-size:13px;font-weight:600;}"
    ".node-sub{font-size:10.5px;fill:%s;}"
    ".label{font-size:11px;font-weight:500;fill:%s;}"
    ".caption{font-size:11px;fill:%s;}"
    "</style>" % (FONT, P["slate700"], P["slate900"], P["slate500"], P["slate600"], P["slate500"], P["slate500"])
)

def arrow(color=P["slate300"], aid="ar"):
    return (
        '<marker id="%s" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">'
        '<path d="M0,0 L8,3 L0,6 Z" fill="%s"/></marker>' % (aid, color)
    )

def arrow_primary():
    return arrow(P["primary"], "arP")

def arrow_accent():
    return arrow(P["accent"], "arA")

def svg_open(w, h, title="", subtitle=""):
    s = ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">'
         % (w, h, w, h) + STYLE +
         '<defs>' + arrow() + arrow_primary() + arrow_accent() + '</defs>' +
         '<rect width="%d" height="%d" fill="%s"/>' % (w, h, P["white"]))
    if title:
        s += '<text x="%d" y="36" text-anchor="middle" class="title">%s</text>' % (w/2, title)
    if subtitle:
        s += '<text x="%d" y="58" text-anchor="middle" class="subtitle">%s</text>' % (w/2, subtitle)
    return s

def svg_close():
    return '</svg>'

def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def round_rect(x, y, w, h, fill, stroke, r=8, stroke_w=1.2):
    return '<rect x="%d" y="%d" width="%d" height="%d" rx="%d" ry="%d" fill="%s" stroke="%s" stroke-width="%.1f"/>' % (
        x, y, w, h, r, r, fill, stroke, stroke_w)

def box(x, y, w, h, title, fill=P["white"], stroke=P["primary"], sub=None, tcolor=P["slate700"], r=8):
    s = '<g>' + round_rect(x, y, w, h, fill, stroke, r)
    cy = y + h/2
    if sub:
        s += '<text x="%d" y="%d" text-anchor="middle" class="node-title" style="fill:%s">%s</text>' % (x+w/2, cy-2, tcolor, esc(title))
        s += '<text x="%d" y="%d" text-anchor="middle" class="node-sub">%s</text>' % (x+w/2, cy+14, esc(sub))
    else:
        s += '<text x="%d" y="%d" text-anchor="middle" class="node-title" style="fill:%s">%s</text>' % (x+w/2, cy+5, tcolor, esc(title))
    s += '</g>'
    return s

def pill(x, y, w, h, title, fill=P["primary"], stroke=P["primary"], tcolor=P["white"]):
    r = h/2
    s = '<g>' + round_rect(x, y, w, h, fill, stroke, r)
    s += '<text x="%d" y="%d" text-anchor="middle" class="node-title" style="fill:%s">%s</text>' % (
        x+w/2, y+h/2+6, tcolor, esc(title))
    s += '</g>'
    return s

def decision(x, y, w, h, title):
    # diamond
    hw = w/2; hh = h/2
    pts = "%(x)d,%(y0)d %(x1)d,%(y)d %(x)d,%(y1)d %(x0)d,%(y)d" % {
        "x": x+hw, "y0": y, "x1": x+w, "y": y+hh, "y1": y+h, "x0": x}
    s = '<g>'
    s += '<polygon points="%s" fill="%s" stroke="%s" stroke-width="1.2"/>' % (pts, P["accentLight"], P["accent"])
    s += '<text x="%d" y="%d" text-anchor="middle" class="node-title" style="fill:%s">%s</text>' % (
        x+hw, y+hh+4, P["accent"], esc(title))
    s += '</g>'
    return s

def band(x, y, w, h, label, tint=P["slate50"], bar=P["primary"]):
    s = round_rect(x, y, w, h, tint, P["slate100"], 10, 1)
    s += '<rect x="%d" y="%d" width="5" height="%d" rx="2.5" fill="%s"/>' % (x, y, h, bar)
    s += '<text x="%d" y="%d" class="subtitle" fill="%s">%s</text>' % (x+16, y+20, bar, esc(label))
    return s

def connector(x1, y1, x2, y2, color=P["slate300"], dashed=False, marker="ar", width=1.5):
    dash = 'stroke-dasharray="6 4" ' if dashed else ''
    return '<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="%.1f" %smarker-end="url(#%s)"/>' % (
        x1, y1, x2, y2, color, width, dash, marker)

def poly(points, color=P["slate300"], dashed=False, marker="ar", width=1.5):
    pts = " ".join("%d,%d" % (x, y) for x, y in points)
    dash = 'stroke-dasharray="6 4" ' if dashed else ''
    return '<polyline points="%s" fill="none" stroke="%s" stroke-width="%.1f" %smarker-end="url(#%s)"/>' % (
        pts, color, width, dash, marker)

def label(x, y, text, size=11, color=P["slate500"], anchor="middle", weight=500, bg=False):
    s = ""
    if bg:
        # approximate Chinese text width: each char ~ 0.78 * size
        tw = len(text) * size * 0.78
        s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="%s" opacity="0.92" rx="2"/>' % (
            x-3, y-size-2, tw+6, size+7, P["white"])
    s += '<text x="%d" y="%d" font-size="%d" fill="%s" text-anchor="%s" font-weight="%d">%s</text>' % (
        x, y, size, color, anchor, weight, esc(text))
    return s

def caption(doc_w, y, text):
    return label(doc_w/2, y, text, size=11, color=P["slate500"], anchor="middle", weight=600)

# ===== generic horizontal pipeline builder =====
def flow_pipeline(w, steps, y=110, row2_y=None, row2_steps=None, decisions=None):
    """
    steps: list of (title, sub) tuples
    y: vertical position
    """
    n = len(steps)
    gap = 34
    if n <= 5:
        bw = 170
    elif n == 6:
        bw = 148
    else:
        bw = 130
    total = n*bw + (n-1)*gap
    start_x = (w - total) // 2
    s = ""
    xs = []
    for i, (t, sub) in enumerate(steps):
        x = start_x + i*(bw+gap)
        xs.append(x)
        s += box(x, y, bw, 58, t, sub=sub)
        if i > 0:
            s += connector(xs[i-1]+bw, y+29, x, y+29)
    if row2_steps:
        m = len(row2_steps)
        total2 = m*bw + (m-1)*gap
        start_x2 = (w - total2) // 2
        xs2 = []
        for i, (t, sub) in enumerate(row2_steps):
            x = start_x2 + i*(bw+gap)
            xs2.append(x)
            s += box(x, row2_y, bw, 58, t, sub=sub)
            if i > 0:
                s += connector(xs2[i-1]+bw, row2_y+29, x, row2_y+29)
        # connect first row last to second row first
        s += connector(xs[-1]+bw, y+29, xs2[0], row2_y+29, color=P["primary"], marker="arP")
    return s

# =========================================================
# 1. 业务架构图
# =========================================================
def d_business():
    w, h = 1120, 720
    s = svg_open(w, h, "图 3-1  数字乡村平台业务架构图")
    # users
    s += band(30, 56, 1060, 92, "用户触点（四端）", P["primaryLight"], P["primary"])
    users = ["村民移动/H5端", "村干部移动端", "乡镇管理PC后台", "县级管理PC后台", "领导/参观数据大屏"]
    uw = 190
    for i, t in enumerate(users):
        x = 55 + i*(uw+16)
        s += box(x, 84, uw, 50, t, fill=P["white"], stroke=P["primary"])
    # business domains
    s += band(30, 160, 1060, 200, "业务能力域（县-乡-村三级协同）", P["secondaryLight"], P["secondary"])
    apps = [
        ("组织与用户", "组织树/干部/村民"), ("三务公开", "党务村务财务"),
        ("基层治理", "网格+随手拍"), ("便民服务", "掌上办事"),
        ("积分激励", "积分制运营"), ("产业文旅", "农旅资源"),
        ("认养农业", "产销对接"), ("设备管理", "IoT台账"),
        ("数据大屏", "一屏统览"), ("千村千面", "村级定制"),
    ]
    cw, ch = 194, 64
    for i, (t, sub) in enumerate(apps):
        col, row = i % 5, i // 5
        x = 48 + col*(cw+18); y = 188 + row*(ch+14)
        s += box(x, y, cw, ch, t, sub=sub, stroke=P["secondary"])
    # middle platform
    s += band(30, 372, 1060, 110, "业务中台与共享能力", P["primaryLight"], P["primary"])
    mid = ["统一身份认证", "流程引擎", "表单引擎", "审核中心", "消息中心", "规则引擎"]
    mw = 158
    for i, t in enumerate(mid):
        x = 48 + i*(mw+14); y = 400
        s += box(x, y, mw, 58, t, stroke=P["primary"])
    # data
    s += band(30, 496, 1060, 96, "数据底座", P["slate100"], P["slate500"])
    data = ["业务主数据库", "空间/GIS库", "时序数据库", "数据治理", "指标计算"]
    dw = 194
    for i, t in enumerate(data):
        x = 48 + i*(dw+18); y = 524
        s += box(x, y, dw, 52, t, stroke=P["slate500"])
    # infra
    s += band(30, 606, 1060, 78, "基础设施与安全底座", P["primaryLight"], P["primary"])
    infra = ["政务云/私有云", "容器编排", "API网关", "等保安全", "运维监控"]
    iw = 194
    for i, t in enumerate(infra):
        x = 48 + i*(iw+18); y = 634
        s += box(x, y, iw, 38, t, stroke=P["primary"], tcolor=P["slate700"], sub=None)
    # vertical connectors
    s += connector(560, 148, 560, 160)
    s += connector(560, 360, 560, 372)
    s += connector(560, 482, 560, 496)
    s += connector(560, 592, 560, 606)
    s += caption(w, 705, "治理增效 · 产业升级 · 服务便民 · 一屏统览")
    s += svg_close()
    return "business_architecture.svg", s

# =========================================================
# 2. 核心业务流程总图
# =========================================================
def d_process():
    w, h = 1200, 560
    s = svg_open(w, h, "图 5-0  核心业务流程总图")
    # central hub
    hub_x, hub_y, hub_w, hub_h = 440, 210, 320, 100
    s += box(hub_x, hub_y, hub_w, hub_h, "业务中台", sub="受理 · 分派 · 审核 · 留痕",
             fill=P["primary"], stroke=P["primary"], tcolor=P["white"])
    # left triggers
    trig = ["村民随手拍上报", "便民在线申请", "村民议事发起", "积分兑换请求", "干部巡查任务"]
    for i, t in enumerate(trig):
        y = 60 + i*80
        s += box(60, y, 220, 52, t, stroke=P["secondary"])
        target_y = hub_y + 18 + i*16
        s += connector(280, y+26, hub_x, target_y, color=P["slate300"])
    # right outcomes
    out = ["处置/办理闭环", "审核通过/驳回", "办结反馈评价", "积分发放/订单", "数据沉淀看板"]
    for i, t in enumerate(out):
        y = 60 + i*80
        s += box(920, y, 220, 52, t, stroke=P["secondary"])
        source_y = hub_y + 18 + i*16
        s += connector(hub_x+hub_w, source_y, 920, y+26, color=P["slate300"])
    # top
    s += box(hub_x, 50, hub_w, 58, "乡村入驻开通", sub="申请 → 审核 → 配置 → 运营",
             fill=P["accent"], stroke=P["accent"], tcolor=P["white"])
    s += connector(hub_x+hub_w/2, 108, hub_x+hub_w/2, hub_y)
    # bottom
    s += box(hub_x, 410, hub_w, 58, "大屏 / 报表 / 决策", sub="数据驱动治理",
             fill=P["secondary"], stroke=P["secondary"], tcolor=P["white"])
    s += connector(hub_x+hub_w/2, hub_y+hub_h, hub_x+hub_w/2, 410)
    s += label(w/2, 510, "数据闭环：接入 → 中台处理 → 输出反馈 → 数据沉淀", size=11,
               color=P["slate500"], anchor="middle", weight=600)
    s += svg_close()
    return "business_process.svg", s

# =========================================================
# 3. 角色权限架构图
# =========================================================
def card(x, y, w, h, title, items, accent, footnote=None, footnote_accent=None):
    """Clean card with title bar and left-aligned list."""
    s = round_rect(x, y, w, h, P["white"], P["slate200"], r=10, stroke_w=1)
    # title bar
    s += round_rect(x, y, w, 44, accent, accent, r=10, stroke_w=0)
    # mask bottom corners of title bar to keep rounded top only
    s += '<rect x="%d" y="%d" width="%d" height="%d" fill="%s"/>' % (x+1, y+34, w-2, 12, accent)
    s += label(x + w/2, y + 28, title, size=14, color=P["white"], anchor="middle", weight=600)
    # items with bullets
    line_h = 30
    start_y = y + 78
    for i, it in enumerate(items):
        cy = start_y + i*line_h
        s += '<circle cx="%d" cy="%d" r="3" fill="%s"/>' % (x + 18, cy - 4, accent)
        s += label(x + 30, cy, it, size=12, color=P["slate700"], anchor="start")
    if footnote:
        fy = y + h - 24
        s += '<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="1"/>' % (
            x + 16, fy - 14, x + w - 16, fy - 14, P["slate200"])
        s += label(x + w/2, fy, footnote, size=11, color=footnote_accent or accent, anchor="middle", weight=600)
    return s

def d_rbac():
    w, h = 1200, 720
    s = svg_open(w, h, "图 4-1  角色权限与组织隔离架构图")

    # ---- org tree ----
    root_y = 60
    s += box(460, root_y, 280, 58, "县级组织（根）", fill=P["primary"], stroke=P["primary"], tcolor=P["white"])

    town_y = 150
    s += box(120, town_y, 240, 52, "乡级组织 A", fill=P["primaryLight"], stroke=P["primary"])
    s += box(840, town_y, 240, 52, "乡级组织 B", fill=P["primaryLight"], stroke=P["primary"])
    # root -> towns
    s += connector(510, root_y+58, 240, town_y, color=P["slate300"])
    s += connector(690, root_y+58, 960, town_y, color=P["slate300"])

    village_y = 240
    vw, vh = 170, 48
    villages_a = [(60 + i*(vw+16), village_y) for i in range(2)]
    villages_b = [(820 + i*(vw+16), village_y) for i in range(2)]
    for vx, vy in villages_a:
        s += box(vx, vy, vw, vh, "村级组织", fill=P["white"], stroke=P["primary"])
    for vx, vy in villages_b:
        s += box(vx, vy, vw, vh, "村级组织", fill=P["white"], stroke=P["primary"])
    # town -> villages
    s += connector(240, town_y+52, (villages_a[0][0]+villages_a[-1][0]+vw)/2, village_y, color=P["slate300"])
    s += connector(960, town_y+52, (villages_b[0][0]+villages_b[-1][0]+vw)/2, village_y, color=P["slate300"])
    # ellipsis village under org B
    s += box(1000, village_y, 120, vh, "…", fill=P["slate50"], stroke=P["slate300"])

    # ---- connecting arrow from org tree to cards ----
    s += connector(w/2, village_y+48, w/2, 330, color=P["primary"], marker="arP")

    # ---- three cards ----
    card_w, card_h = 360, 280
    gap = 40
    start_x = (w - 3*card_w - 2*gap) // 2
    card_y = 350

    s += card(start_x, card_y, card_w, card_h,
              "角色 Role",
              ["县级管理员", "乡镇管理员", "村级管理员", "村干部", "村民"],
              P["primary"],
              "菜单权限 + 数据权限，按组织树隔离",
              P["primary"])

    s += card(start_x + card_w + gap, card_y, card_w, card_h,
              "用户 User",
              ["归属一个组织节点", "绑定一个或多个角色", "四端统一身份认证 SSO", "操作全程审计留痕"],
              P["secondary"],
              "组织边界自动限定数据范围",
              P["secondary"])

    s += card(start_x + 2*(card_w + gap), card_y, card_w, card_h,
              "权限引擎",
              ["RBAC：角色 ↔ 权限映射", "组织隔离：县/乡/村三级可见", "敏感操作需二次审核", "防越权校验与审计日志"],
              P["accent"],
              "最小权限原则",
              P["accent"])

    # tiny arrows between cards (role -> user -> engine)
    s += connector(start_x + card_w, card_y + card_h/2, start_x + card_w + gap, card_y + card_h/2,
                   color=P["slate300"])
    s += connector(start_x + 2*card_w + gap, card_y + card_h/2, start_x + 2*(card_w + gap), card_y + card_h/2,
                   color=P["slate300"])

    s += caption(w, 665, "身份与权限贯穿县-乡-村三级组织与四端应用")
    s += svg_close()
    return "rbac_architecture.svg", s

# =========================================================
# 4. 核心实体关系图 (ER)
# =========================================================
def d_er():
    w, h = 1200, 720
    s = svg_open(w, h, "图 7-1  核心数据实体关系图（ER）")

    # Three-column layout with staggered rows so relationship lines don't cross boxes
    ents = {
        "org":      ("组织(县/乡/村)", 60, 60, 220, 52),
        "user":     ("用户(干部/村民)", 60, 180, 220, 52),
        "villager": ("村民/农户档案", 60, 300, 220, 52),
        "role":     ("角色/权限", 60, 420, 220, 52),
        "affair":   ("事务/诉求/事件", 360, 60, 220, 52),
        "form":     ("表单/采集", 360, 180, 220, 52),
        "points":   ("积分账户", 360, 300, 220, 52),
        "order":    ("兑换订单", 360, 420, 220, 52),
        "goods":    ("积分商品", 360, 540, 220, 52),
        "device":   ("物联网设备", 720, 140, 220, 52),
        "industry": ("产业/资源(地块)", 720, 260, 220, 52),
        "screen":   ("数据大屏配置", 720, 380, 220, 52),
    }
    colors = {
        "org": P["primary"], "user": P["primary"], "villager": P["primary"], "role": P["primary"],
        "affair": P["accent"], "form": P["accent"],
        "points": P["secondary"], "order": P["secondary"], "goods": P["secondary"],
        "device": P["slate500"], "industry": P["slate500"], "screen": P["slate500"],
    }
    for k, (t, x, y, ww, hh) in ents.items():
        s += box(x, y, ww, hh, t, stroke=colors[k])

    def rel_h(a, b, rel_text, via_y=None):
        """Horizontal-ish relationship with optional fixed y via point."""
        ax, ay, aw, ah = ents[a][1], ents[a][2], ents[a][3], ents[a][4]
        bx, by, bw, bh = ents[b][1], ents[b][2], ents[b][3], ents[b][4]
        y1 = ay + ah/2
        if via_y is None:
            via_y = y1
        seg = poly([(ax+aw, y1), (620, y1), (620, via_y), (bx, via_y)], color=P["slate300"])
        # place label in the right-hand channel; if line is short put it above the target box
        dist = bx - (ax+aw)
        ly = via_y - 18 if dist < 140 else via_y - 8
        seg += label(640, ly, rel_text, size=10, color=P["slate700"], bg=True)
        return seg

    def rel_v(a, b, rel_text, via_x=None):
        """Vertical relationship within same column."""
        ax, ay, aw, ah = ents[a][1], ents[a][2], ents[a][3], ents[a][4]
        bx, by, bw, bh = ents[b][1], ents[b][2], ents[b][3], ents[b][4]
        x1 = ax + aw/2
        x2 = bx + bw/2
        if via_x is None:
            via_x = x1
        seg = poly([(x1, ay+ah), (via_x, ay+ah), (via_x, by), (x2, by)], color=P["slate300"])
        # place label near the top of the line so it doesn't sit in the middle of a box below
        dist = by - (ay+ah)
        ly = ay+ah + (dist * 0.25)
        seg += label(via_x + 12, ly, rel_text, size=10, color=P["slate700"], bg=True)
        return seg

    # org -> column 2 (via channel x=620)
    s += rel_h("org", "affair", "1—*", via_y=86)
    s += rel_h("org", "user", "1—*", via_y=206)
    s += rel_h("org", "device", "1—*", via_y=166)
    s += rel_h("org", "industry", "1—*", via_y=286)
    s += rel_h("org", "screen", "1—*", via_y=406)

    # user -> column 2
    s += rel_h("user", "form", "1—*", via_y=206)
    s += rel_h("user", "points", "1—1", via_y=326)

    # user -> column 1 internal
    s += rel_v("user", "villager", "1—1", via_x=170)
    s += rel_v("user", "role", "*—*", via_x=170)

    # column 2 internal
    s += rel_v("form", "affair", "1—*", via_x=470)
    s += rel_v("points", "order", "1—*", via_x=470)
    s += rel_v("order", "goods", "*—1", via_x=470)

    s += caption(w, 675, "组织为数据隔离根；用户归属组织；业务、积分、设备、产业数据均挂接组织与用户")
    s += svg_close()
    return "er_diagram.svg", s

# =========================================================
# 5. 技术总体架构图
# =========================================================
def d_tech_overall():
    w, h = 1120, 620
    s = svg_open(w, h, "图 10-1  系统总体技术架构图")
    layers = [
        ("表现层（四端）", P["primaryLight"], P["primary"], [
            "PC管理后台(Vue)", "干部移动端(H5)", "村民移动端(H5)", "数据大屏(ECharts)", "千村千面设计器"]),
        ("接入层", P["slate50"], P["slate500"], [
            "API网关", "统一鉴权/SSO", "限流/路由", "HTTPS/TLS"]),
        ("业务服务层（微服务域）", P["secondaryLight"], P["secondary"], [
            "组织用户", "村务", "治理", "服务", "积分", "产业", "设备/IoT", "数据/内容"]),
        ("数据层", P["slate100"], P["slate500"], [
            "关系数据库", "空间/GIS库", "时序库", "Redis缓存", "对象存储"]),
        ("基础设施层", P["primaryLight"], P["primary"], [
            "政务云/私有云", "容器编排(K8s)", "消息队列", "监控运维"]),
    ]
    y = 56
    for i, (label, tint, bar, items) in enumerate(layers):
        h_l = 96 if i in (0, 2) else 78
        s += band(30, y, 1060, h_l, label, tint, bar)
        n = len(items)
        gap = 18
        bw = (1060 - 44 - (n-1)*gap) // n
        for j, t in enumerate(items):
            x = 44 + j*(bw+gap)
            hh = h_l - 32
            s += box(x, y+16, bw, hh, t, stroke=bar)
        y += h_l + 8
        if i < len(layers)-1:
            s += connector(560, y-8, 560, y)
    s += box(30, y+4, 1060, 40, "安全体系（等保/RBAC/审计/脱敏） · DevOps / CI-CD 持续交付 · 统一日志与运维监控",
             fill=P["slate700"], stroke=P["slate700"], tcolor=P["white"])
    s += svg_close()
    return "tech_overall.svg", s

# =========================================================
# 6. 前端架构图
# =========================================================
def d_frontend():
    w, h = 1120, 480
    s = svg_open(w, h, "图 10-2  前端架构图")
    cols = [
        ("四端应用", P["primaryLight"], P["primary"], [
            "PC管理后台(Vue3)", "干部端(H5/Vue)", "村民端(H5/Vue)", "数据大屏(ECharts)", "组件规范库"]),
        ("工程化与基础设施", P["secondaryLight"], P["secondary"], [
            "Vite构建", "VueRouter路由", "Pinia状态", "axios请求层", "移动端适配(430px)"]),
        ("UI 与体验层", P["accentLight"], P["accent"], [
            "共享组件库", "统一设计令牌", "千村千面引擎", "表单/图表组件", "主题与配色"]),
        ("能力输出", P["slate100"], P["slate500"], [
            "扫码/拍照", "消息推送", "定位/地图", "离线降级"]),
    ]
    cw = 250; ch = 300; gap = 20
    start_x = (w - (4*cw + 3*gap)) // 2
    for i, (title, tint, bar, items) in enumerate(cols):
        x = start_x + i*(cw+gap)
        s += band(x, 70, cw, ch, title, tint, bar)
        for j, item in enumerate(items):
            s += label(x+14, 110 + j*46, "• " + item, size=12.5, color=P["slate700"])
        if i < 3:
            s += connector(x+cw, 220, x+cw+gap, 220, color=P["slate300"])
    s += box(start_x, 390, 4*cw+3*gap, 46, "前端原则：组件化 · 配置化 · 一致性 · 移动优先 · 弱网可降级",
             fill=P["slate700"], stroke=P["slate700"], tcolor=P["white"])
    s += svg_close()
    return "frontend_architecture.svg", s

# =========================================================
# 7. 后端架构图
# =========================================================
def d_backend():
    w, h = 1120, 520
    s = svg_open(w, h, "图 10-3  后端微服务架构图")
    s += band(40, 70, 300, 380, "业务微服务域", P["primaryLight"], P["primary"])
    domains = ["组织用户域", "村务域", "治理域", "便民服务域", "积分域",
               "产业文旅域", "设备/IoT域", "数据/内容域", "通知域"]
    for i, t in enumerate(domains):
        col = i % 3; row = i // 3
        x = 60 + col*92; y = 110 + row*88
        s += box(x, y, 84, 62, t, stroke=P["primary"])

    s += band(360, 70, 320, 380, "公共支撑组件", P["secondaryLight"], P["secondary"])
    commons = ["API网关", "注册/配置中心", "统一认证", "流程引擎", "消息队列", "任务调度", "日志/审计", "规则引擎"]
    for i, t in enumerate(commons):
        col = i % 2; row = i // 2
        x = 380 + col*150; y = 110 + row*70
        s += box(x, y, 140, 56, t, stroke=P["secondary"])

    s += band(700, 70, 370, 380, "数据与集成", P["slate100"], P["slate500"])
    data = ["关系数据库(主从)", "空间/GIS库", "时序库(IoT)", "Redis缓存", "对象存储", "数据源配置", "外部系统适配"]
    for i, t in enumerate(data):
        x = 720; y = 110 + i*46
        s += box(x, y, 330, 38, t, stroke=P["slate500"])

    s += connector(340, 260, 360, 260, color=P["primary"], marker="arP")
    s += connector(680, 260, 700, 260, color=P["secondary"], marker="ar")
    s += box(40, 470, 1040, 36, "服务治理：服务注册发现 · 熔断限流 · 链路追踪 · 灰度发布",
             fill=P["slate700"], stroke=P["slate700"], tcolor=P["white"])
    s += svg_close()
    return "backend_architecture.svg", s

# =========================================================
# 8. 部署架构图
# =========================================================
def d_deploy():
    w, h = 1120, 520
    s = svg_open(w, h, "图 10-5  部署架构图")
    # clients
    clients = [("手机/移动端", 60), ("PC 浏览器", 150), ("数据大屏机", 240), ("IoT 设备", 330)]
    for t, y in clients:
        s += box(40, y, 200, 54, t, stroke=P["primary"])
        s += connector(240, y+27, 300, 200)
    # edge
    s += band(300, 150, 220, 250, "接入与反向代理", P["primaryLight"], P["primary"])
    for i, t in enumerate(["CDN 加速", "Nginx 反向代理", "SSL/TLS 终止", "负载均衡"]):
        s += label(320, 192 + i*52, "• " + t, size=12.5, color=P["slate700"])
    # app cluster
    s += band(560, 150, 240, 250, "应用服务集群（容器）", P["secondaryLight"], P["secondary"])
    for i, t in enumerate(["Web/API 多副本", "微服务 Pod", "网关/鉴权", "自动伸缩 HPA", "健康检查"]):
        s += label(580, 192 + i*50, "• " + t, size=12.5, color=P["slate700"])
    # data
    s += band(840, 150, 240, 250, "数据与存储", P["slate100"], P["slate500"])
    for i, t in enumerate(["数据库主从", "Redis 缓存", "对象存储 OSS", "消息中间件", "备份/冷存"]):
        s += label(860, 192 + i*50, "• " + t, size=12.5, color=P["slate700"])
    s += connector(520, 275, 560, 275)
    s += connector(800, 275, 840, 275)
    # bottom
    s += box(300, 430, 300, 56, "政务云 / 私有云", fill=P["primaryLight"], stroke=P["primary"])
    s += box(620, 430, 460, 56, "统一监控告警 · 日志审计 · 等保合规", fill=P["slate700"], stroke=P["slate700"], tcolor=P["white"])
    s += connector(460, 400, 460, 430)
    s += svg_close()
    return "deploy_architecture.svg", s

# =========================================================
# 9. 集成架构图
# =========================================================
def d_integration():
    w, h = 1120, 480
    s = svg_open(w, h, "图 10-6  系统集成架构图")
    s += box(420, 60, 280, 70, "数字乡村平台（核心）", fill=P["primary"], stroke=P["primary"], tcolor=P["white"])
    s += band(420, 160, 280, 110, "集成适配层", P["primaryLight"], P["primary"])
    adapters = ["API 网关", "数据源配置", "消息总线", "协议转换"]
    for i, t in enumerate(adapters):
        x = 432 + i*66
        s += box(x, 195, 60, 58, t, stroke=P["primary"])
    s += connector(560, 130, 560, 160)
    # left externals
    left = [("IoT 设备/传感器", 60), ("第三方支付", 190), ("地图/位置服务", 300), ("短信/消息网关", 390)]
    for t, y in left:
        s += box(40, y, 240, 46, t, stroke=P["secondary"])
        s += connector(280, y+23, 420, 210 + (y-60)/6)
    # right externals
    right = [("上级政务平台", 60), ("大数据平台", 190), ("财政/医保等", 300), ("外部数据源", 390)]
    for t, y in right:
        s += box(840, y, 240, 46, t, stroke=P["accent"])
        s += connector(700, 210 + (y-60)/6, 840, y+23)
    s += caption(w, 460, "通过标准 API / 消息 / 数据源配置实现松耦合对接，支撑“一县一档、千村千面”的可扩展集成")
    s += svg_close()
    return "integration_architecture.svg", s

# =========================================================
# 10. 数据架构 / 数据流图
# =========================================================
def d_dataflow():
    w, h = 1120, 420
    s = svg_open(w, h, "图 7-3  数据架构与流向图")
    stages = [
        ("采集接入", P["primary"], ["移动端填报", "IoT/设备", "外部系统", "数据源配置"]),
        ("治理存储", P["secondary"], ["清洗/ETL", "数据字典", "质量校验", "多库存储"]),
        ("计算加工", P["accent"], ["指标计算", "标签画像", "汇总统计", "时空分析"]),
        ("服务输出", P["slate500"], ["报表中心", "数据大屏", "移动端", "开放API"]),
    ]
    bw = 250
    for i, (title, bar, items) in enumerate(stages):
        x = 30 + i*(bw+16)
        s += box(x, 70, bw, 58, title, fill=bar, stroke=bar, tcolor=P["white"])
        for j, t in enumerate(items):
            s += box(x+10, 150+j*50, bw-20, 40, t, stroke=bar)
        if i < 3:
            s += connector(x+bw, 99, x+bw+16, 99, color=P["primary"], marker="arP")
    s += box(30, 370, 1060, 40, "数据资产管理：元数据 · 数据血缘 · 安全脱敏 · 分级授权 · 保留归档（业务流水≥3年）",
             fill=P["slate700"], stroke=P["slate700"], tcolor=P["white"])
    s += caption(w, 345, "数据闭环：采集 → 治理 → 计算 → 服务，反向驱动业务优化")
    s += svg_close()
    return "dataflow_architecture.svg", s

# =========================================================
# helper for single-row business flow diagrams
# =========================================================
def make_flow(name, title, steps, note=""):
    """steps: list of (label, sub) for the main horizontal flow."""
    w, h = 1120, 300
    s = svg_open(w, h, title)
    n = len(steps)
    gap = 30
    bw = (min(1050, w-60) - (n-1)*gap) // n
    total = n*bw + (n-1)*gap
    sx = (w - total) // 2
    y = 95
    xs = []
    for i, (lab, sub) in enumerate(steps):
        x = sx + i*(bw+gap)
        xs.append(x)
        if i == 0:
            s += pill(x, y, bw, 50, lab, fill=P["primary"], stroke=P["primary"])
        elif i == n - 1:
            s += pill(x, y, bw, 50, lab, fill=P["secondary"], stroke=P["secondary"])
        else:
            s += box(x, y, bw, 50, lab, sub=sub)
        if i > 0:
            s += connector(xs[i-1]+bw, y+25, x, y+25, color=P["slate300"])
    if note:
        s += caption(w, 255, note)
    s += svg_close()
    return name, s

# =========================================================
# 11-22. 12 business process flowcharts
# =========================================================
def d_flow_01():
    return make_flow(
        "flow_05_01_village_activation.svg",
        "图 5-1  乡村开通流程",
        [("提交入驻申请", "乡/村发起"),
         ("县级初审", "资料完整性"),
         ("县级审核", "资质/合规"),
         ("开通账号", "组织初始化"),
         ("千村千面配置", "首页/模块"),
         ("正式上线", "运营开始")],
        "未通过审核：退回补充资料后重新提交"
    )

def d_flow_02():
    return make_flow(
        "flow_05_02_party_building.svg",
        "图 5-2  党建引领流程",
        [("发布活动", "党组织/管理员"),
         ("党员查看", "移动端"),
         ("报名参与", "在线签到"),
         ("学习/活动记录", "过程留痕"),
         ("统计归档", "组织生活台账"),
         ("党建大屏展示", "可视化")],
        "覆盖信息发布、党员管理、党委会议、三会一课"
    )

def d_flow_03():
    return make_flow(
        "flow_05_03_sunshine_village.svg",
        "图 5-3  阳光村务流程",
        [("起草公开内容", "党务/村务/财务"),
         ("村级审核", "内容合规"),
         ("上级备案", "乡镇/县"),
         ("发布公示", "多端公开"),
         ("村民查看监督", "在线浏览"),
         ("意见收集归档", "反馈留痕")],
        "公示期限、查看次数、意见反馈全流程可追溯"
    )

def d_flow_04():
    return make_flow(
        "flow_05_04_grassroots_governance.svg",
        "图 5-4  基层治理流程",
        [("事件上报", "随手拍/网格"),
         ("受理登记", "生成工单"),
         ("分派网格员", "责任到人"),
         ("现场处置", "过程记录"),
         ("反馈结果", "图文/定位"),
         ("审核结案", "闭环管理")],
        "处置结果同步至治理大屏，支撑态势研判"
    )

def d_flow_05():
    return make_flow(
        "flow_05_05_points_management.svg",
        "图 5-5  积分管理流程",
        [("参与治理活动", "村民主动参与"),
         ("积分申请", "提交证明材料"),
         ("干部审核", "规则校验"),
         ("积分发放", "账户到账"),
         ("积分商城兑换", "选商品下单"),
         ("核销完成", "村干部确认")],
        "积分规则、审核人员、明细记录形成完整闭环"
    )

def d_flow_06():
    return make_flow(
        "flow_05_06_rural_tourism.svg",
        "图 5-6  乡村旅游流程",
        [("资源登记", "村维护资源"),
         ("平台审核", "内容上线"),
         ("上线展示", "景点/线路"),
         ("游客浏览/预订", "在线下单"),
         ("订单确认", "服务接待"),
         ("评价反馈", "口碑沉淀")],
        "旅游资源 → 线上引流 → 线下接待 → 评价闭环"
    )

def d_flow_07():
    return make_flow(
        "flow_05_07_agricultural_adoption.svg",
        "图 5-7  农业认养流程",
        [("发布认养项目", "村集体/农户"),
         ("消费者下单", "在线支付"),
         ("签订协议", "电子协议"),
         ("种养管理", "农事记录"),
         ("生长记录", "图文/视频"),
         ("产出配送", "物流/自提"),
         ("溯源查看", "扫码追溯")],
        "认养、养护、配送、溯源全链路数字化"
    )

def d_flow_08():
    return make_flow(
        "flow_05_08_form_application.svg",
        "图 5-8  表单应用流程",
        [("创建表单", "设计字段"),
         ("配置规则", "校验/逻辑"),
         ("发布采集", "生成链接"),
         ("村民填报", "移动端/H5"),
         ("数据汇总", "实时统计"),
         ("审核/签章", "线上审批"),
         ("导出归档", "Excel/PDF")],
        "支持签章管理、回收站、我发布的/我的经办"
    )

def d_flow_09():
    return make_flow(
        "flow_05_09_device_management.svg",
        "图 5-9  设备管理流程",
        [("台账登记", "设备基础信息"),
         ("接入配置", "协议/通道"),
         ("状态监测", "在线/离线"),
         ("告警触发", "阈值/异常"),
         ("工单派发", "责任人处理"),
         ("巡检维护", "保养记录"),
         ("台账更新", "状态同步")],
        "覆盖沃家云视、雁飞、小喇叭、萤石云、乐橙云五类设备"
    )

def d_flow_10():
    return make_flow(
        "flow_05_10_data_management.svg",
        "图 5-10  数据管理流程",
        [("多源接入", "产业/房屋/土地"),
         ("清洗/ETL", "去重/转换"),
         ("数据治理", "字典/质量"),
         ("指标计算", "汇总/标签"),
         ("报表/大屏", "可视化"),
         ("归档留存", "冷存储")],
        "产业、房屋、土地、企业四类数据统一管理"
    )

def d_flow_11():
    return make_flow(
        "flow_05_11_thousand_villages.svg",
        "图 5-11  千村千面配置流程",
        [("选择模板", "首页/更多页"),
         ("配置模块", "功能组件"),
         ("配置主题", "配色/样式"),
         ("预览效果", "多端模拟"),
         ("发布生效", "版本切换"),
         ("村民端同步", "实时更新")],
        "每个村可独立配置首页布局、配色与功能模块"
    )

def d_flow_12():
    return make_flow(
        "flow_05_12_villager_service.svg",
        "图 5-12  村民办事流程",
        [("查询指南", "事项/材料"),
         ("在线申请", "填写表单"),
         ("上传材料", "图片/附件"),
         ("受理审核", "村干部/系统"),
         ("办理中", "进度可查"),
         ("办理完成", "结果通知"),
         ("结果回执/评价", "闭环")],
        "从事项查询到结果评价，全程线上可查可追"
    )

# =========================================================
def main():
    funcs = [
        d_business, d_process, d_rbac, d_er, d_tech_overall, d_frontend,
        d_backend, d_deploy, d_integration, d_dataflow,
        d_flow_01, d_flow_02, d_flow_03, d_flow_04, d_flow_05, d_flow_06,
        d_flow_07, d_flow_08, d_flow_09, d_flow_10, d_flow_11, d_flow_12,
    ]
    for f in funcs:
        name, svg = f()
        with open(os.path.join(OUT, name), "w", encoding="utf-8") as fh:
            fh.write(svg)
        print("WROTE", name)

if __name__ == "__main__":
    main()
