/**
 * 数字乡村大屏端 · Dashboard JavaScript v3.0
 * ECharts图表初始化 · Tab切换 · 自动缩放 · 轮播
 * 设计系统：生态绿 v3.0（图表色 = 绿 + 暖棕 + 中性）
 */

(function () {
  'use strict';

  /* ============================================
     A. 统一图表配色与基础配置
     ============================================ */
  var chartColors = ['#16a34a', '#0f766e', '#f59e0b', '#92400e', '#10b981', '#ef4444', '#22c55e'];

  var baseTooltip = {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: 'rgba(22,163,74,0.2)',
    borderWidth: 1,
    textStyle: { color: '#14532d', fontSize: 13 },
    extraCssText: 'box-shadow: 0 4px 12px rgba(22,163,74,0.15); border-radius: 8px;'
  };

  var baseLegend = {
    right: 10, top: 10,
    textStyle: { color: '#57534e', fontSize: 12 },
    itemWidth: 12, itemHeight: 12,
    itemGap: 10
  };

  var baseAxisLabel = { color: '#78716c', fontSize: 12 };
  var baseAxisLine = { lineStyle: { color: 'rgba(22,163,74,0.15)' } };
  var baseSplitLine = { lineStyle: { color: 'rgba(22,163,74,0.06)' } };

  var charts = {}; // Store all chart instances

  function initChart(id, option) {
    var el = document.getElementById(id);
    if (!el || typeof echarts === 'undefined') return null;
    var chart = echarts.init(el);
    chart.setOption(option);
    charts[id] = chart;
    return chart;
  }

  /* ============================================
     B. 各Tab图表配置
     ============================================ */

  /* ---- Tab 1: 村情总览 ---- */

  // 1-1. 人口结构饼图
  initChart('chart-pop-structure', {
    color: chartColors,
    tooltip: Object.assign({}, baseTooltip, { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' }),
    legend: Object.assign({}, baseLegend, { orient: 'vertical', right: 10, top: 'center', itemGap: 8 }),
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['38%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 600, color: '#14532d' },
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(22,163,74,0.2)' }
      },
      data: [
        { value: 280, name: '0-6岁' },
        { value: 412, name: '7-17岁' },
        { value: 1076, name: '18-35岁' },
        { value: 1346, name: '36-59岁' },
        { value: 732, name: '60岁以上' }
      ]
    }]
  });

  // 1-2. 年龄段分布柱状图
  initChart('chart-age-dist', {
    color: [chartColors[0]],
    tooltip: Object.assign({}, baseTooltip, { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}: {c}人' }),
    grid: { left: 50, right: 20, top: 30, bottom: 35 },
    xAxis: {
      type: 'category',
      data: ['0-6岁', '7-17岁', '18-35岁', '36-59岁', '60岁以上'],
      axisLabel: Object.assign({}, baseAxisLabel, { fontSize: 11 }),
      axisLine: baseAxisLine,
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: baseAxisLabel,
      splitLine: baseSplitLine,
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      barWidth: '50%',
      data: [280, 412, 1076, 1346, 732],
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#16a34a' },
          { offset: 1, color: '#bbf7d0' }
        ])
      }
    }]
  });

  /* ---- Tab 2: 产业兴旺 ---- */

  // 2-1. 产业链结构饼图
  initChart('chart-industry-structure', {
    color: chartColors,
    tooltip: Object.assign({}, baseTooltip, { trigger: 'item', formatter: '{b}: {d}%' }),
    legend: Object.assign({}, baseLegend, { orient: 'vertical', right: 10, top: 'center', itemGap: 8 }),
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['38%', '50%'],
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 600, color: '#14532d' },
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(22,163,74,0.2)' }
      },
      data: [
        { value: 45, name: '种植业' },
        { value: 25, name: '养殖业' },
        { value: 15, name: '加工业' },
        { value: 10, name: '乡村旅游' },
        { value: 5, name: '其他' }
      ]
    }]
  });

  // 2-2. 近5年产业产值趋势柱状图（双柱）
  initChart('chart-industry-trend', {
    color: [chartColors[0], chartColors[2]],
    tooltip: Object.assign({}, baseTooltip, { trigger: 'axis', axisPointer: { type: 'shadow' } }),
    legend: Object.assign({}, baseLegend, { data: ['总产值(万元)', '同比增长(%)'] }),
    grid: { left: 60, right: 60, top: 50, bottom: 35 },
    xAxis: {
      type: 'category',
      data: ['2022年', '2023年', '2024年', '2025年', '2026年'],
      axisLabel: baseAxisLabel,
      axisLine: baseAxisLine,
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value', name: '产值(万元)',
        nameTextStyle: { color: '#78716c', fontSize: 11 },
        axisLabel: baseAxisLabel,
        splitLine: baseSplitLine,
        axisLine: { show: false },
        axisTick: { show: false }
      },
      {
        type: 'value', name: '增长(%)',
        nameTextStyle: { color: '#78716c', fontSize: 11 },
        axisLabel: Object.assign({}, baseAxisLabel, { formatter: '{value}%' }),
        splitLine: { show: false },
        axisLine: { show: false },
        axisTick: { show: false }
      }
    ],
    series: [
      {
        name: '总产值(万元)', type: 'bar', barWidth: '35%',
        data: [7800, 8900, 9800, 10800, 12000],
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#16a34a' }, { offset: 1, color: '#bbf7d0' }
          ])
        }
      },
      {
        name: '同比增长(%)', type: 'line', yAxisIndex: 1, smooth: true,
        data: [0, 14.1, 10.1, 10.2, 11.1],
        lineStyle: { width: 2.5, color: chartColors[2] },
        itemStyle: { color: chartColors[2] },
        symbol: 'circle', symbolSize: 8
      }
    ]
  });

  // 2-3. 主要产业产值排行横向柱状图
  initChart('chart-industry-rank', {
    color: [chartColors[0]],
    tooltip: Object.assign({}, baseTooltip, { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}: {c}万元' }),
    grid: { left: 80, right: 40, top: 20, bottom: 30 },
    xAxis: {
      type: 'value',
      axisLabel: baseAxisLabel,
      splitLine: baseSplitLine,
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'category',
      data: ['手工艺', '电商', '乡村旅游', '中药材', '核桃', '苹果'],
      axisLabel: baseAxisLabel,
      axisLine: baseAxisLine,
      axisTick: { show: false },
      inverse: false
    },
    series: [{
      type: 'bar',
      barWidth: '50%',
      data: [800, 1500, 1800, 2200, 2800, 3200],
      itemStyle: {
        borderRadius: [0, 6, 6, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#bbf7d0' }, { offset: 1, color: '#16a34a' }
        ])
      },
      label: { show: true, position: 'right', color: '#14532d', fontSize: 12, fontWeight: 600 }
    }]
  });

  /* ---- Tab 3: 生态宜居 ---- */

  // 3-1. 环境事件月度趋势折线图
  initChart('chart-env-trend', {
    color: [chartColors[0]],
    tooltip: Object.assign({}, baseTooltip, { trigger: 'axis' }),
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLabel: Object.assign({}, baseAxisLabel, { fontSize: 10 }),
      axisLine: baseAxisLine,
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: baseAxisLabel,
      splitLine: baseSplitLine,
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: 'line', smooth: true, data: [8, 6, 5, 4, 7, 12, 15, 18, 10, 6, 5, 4],
      lineStyle: { width: 2.5 },
      itemStyle: { color: chartColors[0] },
      symbol: 'circle', symbolSize: 6,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(22,163,74,0.2)' },
          { offset: 1, color: 'rgba(22,163,74,0)' }
        ])
      }
    }]
  });

  // 3-2. 环境指标五维雷达图
  initChart('chart-env-radar', {
    color: [chartColors[0], chartColors[1]],
    tooltip: Object.assign({}, baseTooltip),
    legend: Object.assign({}, baseLegend, { data: ['本村', '达标值'] }),
    radar: {
      indicator: [
        { name: '绿化率', max: 100 },
        { name: '水质', max: 100 },
        { name: '空气', max: 100 },
        { name: '噪音控制', max: 100 },
        { name: '垃圾处理', max: 100 }
      ],
      center: ['50%', '55%'],
      radius: '65%',
      axisName: { color: '#57534e', fontSize: 13 },
      splitLine: { lineStyle: { color: 'rgba(22,163,74,0.1)' } },
      splitArea: { areaStyle: { color: ['rgba(22,163,74,0.02)', 'rgba(22,163,74,0.04)'] } },
      axisLine: { lineStyle: { color: 'rgba(22,163,74,0.1)' } }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [68, 85, 92, 80, 100], name: '本村',
          areaStyle: { color: 'rgba(22,163,74,0.15)' },
          lineStyle: { width: 2, color: chartColors[0] },
          itemStyle: { color: chartColors[0] }
        },
        {
          value: [60, 70, 80, 70, 85], name: '达标值',
          areaStyle: { color: 'rgba(15,118,110,0.08)' },
          lineStyle: { width: 2, color: chartColors[1], type: 'dashed' },
          itemStyle: { color: chartColors[1] }
        }
      ]
    }]
  });

  // 3-3. 垃圾分类参与率环形图
  initChart('chart-waste-rate', {
    color: [chartColors[0], '#e7e5e4'],
    tooltip: Object.assign({}, baseTooltip, { trigger: 'item', formatter: '{b}: {c}%' }),
    legend: Object.assign({}, baseLegend, { bottom: 10, top: 'auto' }),
    series: [{
      type: 'pie',
      radius: ['55%', '75%'],
      center: ['50%', '45%'],
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 600, color: '#14532d' } },
      data: [
        { value: 85, name: '已参与' },
        { value: 15, name: '未参与' }
      ]
    }],
    graphic: [{
      type: 'text', left: 'center', top: '40%',
      style: { text: '85%', fontSize: 32, fontWeight: 700, fill: '#16a34a', fontFamily: 'DIN Alternate, DIN, system-ui, sans-serif' }
    }, {
      type: 'text', left: 'center', top: '52%',
      style: { text: '参与率', fontSize: 13, fill: '#78716c' }
    }]
  });

  /* ---- Tab 4: 乡风文明 ---- */

  // 4-1. 文明实践活动统计柱状图
  initChart('chart-culture-activity', {
    color: [chartColors[0]],
    tooltip: Object.assign({}, baseTooltip, { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}: {c}场' }),
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'],
      axisLabel: baseAxisLabel,
      axisLine: baseAxisLine,
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: baseAxisLabel,
      splitLine: baseSplitLine,
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar', barWidth: '45%',
      data: [4, 3, 6, 5, 8, 6, 9, 7],
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#16a34a' }, { offset: 1, color: '#bbf7d0' }
        ])
      }
    }]
  });

  // 4-2. 活动参与趋势折线图（四条线）
  initChart('chart-culture-trend', {
    color: chartColors,
    tooltip: Object.assign({}, baseTooltip, { trigger: 'axis' }),
    legend: Object.assign({}, baseLegend, { data: ['文化活动', '体育活动', '技能培训', '志愿服务'] }),
    grid: { left: 50, right: 20, top: 50, bottom: 35 },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'],
      axisLabel: baseAxisLabel,
      axisLine: baseAxisLine,
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value', name: '人次',
      nameTextStyle: { color: '#78716c', fontSize: 11 },
      axisLabel: baseAxisLabel,
      splitLine: baseSplitLine,
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      { name: '文化活动', type: 'line', smooth: true, data: [120, 95, 180, 150, 220, 190, 280, 240] },
      { name: '体育活动', type: 'line', smooth: true, data: [80, 60, 120, 100, 160, 140, 200, 180] },
      { name: '技能培训', type: 'line', smooth: true, data: [60, 45, 90, 75, 110, 95, 140, 120] },
      { name: '志愿服务', type: 'line', smooth: true, data: [50, 40, 70, 60, 90, 80, 120, 100] }
    ]
  });

  // 4-3. 志愿服务时长排行横向柱状图
  initChart('chart-volunteer-rank', {
    color: [chartColors[2]],
    tooltip: Object.assign({}, baseTooltip, { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}: {c}小时' }),
    grid: { left: 80, right: 40, top: 20, bottom: 30 },
    xAxis: {
      type: 'value',
      axisLabel: baseAxisLabel,
      splitLine: baseSplitLine,
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'category',
      data: ['赵XX', '钱XX', '孙XX', '周XX', '吴XX', '郑XX'],
      axisLabel: baseAxisLabel,
      axisLine: baseAxisLine,
      axisTick: { show: false }
    },
    series: [{
      type: 'bar', barWidth: '50%',
      data: [48, 56, 62, 72, 85, 96],
      itemStyle: {
        borderRadius: [0, 6, 6, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#fbbf24' }, { offset: 1, color: '#f59e0b' }
        ])
      },
      label: { show: true, position: 'right', color: '#14532d', fontSize: 12, fontWeight: 600 }
    }]
  });

  /* ---- Tab 5: 治理有效 ---- */

  // 5-1. 网格巡查统计柱状图
  initChart('chart-grid-patrol', {
    color: [chartColors[0]],
    tooltip: Object.assign({}, baseTooltip, { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}: {c}次' }),
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: ['王建国', '李志强', '张海峰', '赵德明', '刘桂芳', '陈志刚'],
      axisLabel: Object.assign({}, baseAxisLabel, { fontSize: 11 }),
      axisLine: baseAxisLine,
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: baseAxisLabel,
      splitLine: baseSplitLine,
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar', barWidth: '45%',
      data: [28, 32, 25, 30, 26, 35],
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#16a34a' }, { offset: 1, color: '#bbf7d0' }
        ])
      }
    }]
  });

  // 5-2. 事件类型分布饼图
  initChart('chart-event-type', {
    color: chartColors,
    tooltip: Object.assign({}, baseTooltip, { trigger: 'item', formatter: '{b}: {c}件 ({d}%)' }),
    legend: Object.assign({}, baseLegend, { orient: 'vertical', right: 10, top: 'center', itemGap: 8 }),
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['38%', '50%'],
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 600, color: '#14532d' },
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(22,163,74,0.2)' }
      },
      data: [
        { value: 42, name: '环境卫生' },
        { value: 28, name: '基础设施' },
        { value: 22, name: '邻里纠纷' },
        { value: 18, name: '安全隐患' },
        { value: 15, name: '便民服务' },
        { value: 61, name: '其他' }
      ]
    }]
  });

  /* ---- Tab 6: 生活富裕 ---- */

  // 6-1. 收入结构饼图
  initChart('chart-income-structure', {
    color: chartColors,
    tooltip: Object.assign({}, baseTooltip, { trigger: 'item', formatter: '{b}: {c}元 ({d}%)' }),
    legend: Object.assign({}, baseLegend, { orient: 'vertical', right: 10, top: 'center', itemGap: 8 }),
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['38%', '50%'],
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 600, color: '#14532d' },
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(22,163,74,0.2)' }
      },
      data: [
        { value: 16000, name: '工资性收入' },
        { value: 9600, name: '经营性收入' },
        { value: 4200, name: '转移性收入' },
        { value: 2200, name: '财产性收入' }
      ]
    }]
  });

  // 6-2. 近5年收入趋势对比折线图
  initChart('chart-income-trend', {
    color: [chartColors[0], chartColors[2]],
    tooltip: Object.assign({}, baseTooltip, { trigger: 'axis', formatter: function(params) {
      var s = params[0].name + '<br/>';
      params.forEach(function(p) { s += p.marker + p.seriesName + ': ' + p.value + '元<br/>'; });
      return s;
    } }),
    legend: Object.assign({}, baseLegend, { data: ['全村人均收入', '全国农村平均'] }),
    grid: { left: 60, right: 20, top: 50, bottom: 35 },
    xAxis: {
      type: 'category',
      data: ['2022年', '2023年', '2024年', '2025年', '2026年'],
      axisLabel: baseAxisLabel,
      axisLine: baseAxisLine,
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value', name: '元',
      nameTextStyle: { color: '#78716c', fontSize: 11 },
      axisLabel: baseAxisLabel,
      splitLine: baseSplitLine,
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        name: '全村人均收入', type: 'line', smooth: true,
        data: [21000, 24000, 27000, 29500, 32000],
        lineStyle: { width: 3, color: chartColors[0] },
        itemStyle: { color: chartColors[0] },
        symbol: 'circle', symbolSize: 8,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(22,163,74,0.2)' },
            { offset: 1, color: 'rgba(22,163,74,0)' }
          ])
        }
      },
      {
        name: '全国农村平均', type: 'line', smooth: true,
        data: [18900, 20100, 21600, 23100, 24500],
        lineStyle: { width: 2, color: chartColors[2], type: 'dashed' },
        itemStyle: { color: chartColors[2] },
        symbol: 'circle', symbolSize: 6
      }
    ]
  });

  // 6-3. 就业分布柱状图
  initChart('chart-employment-dist', {
    color: [chartColors[0]],
    tooltip: Object.assign({}, baseTooltip, { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}: {c}人' }),
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: ['务农', '务工', '经商', '灵活就业'],
      axisLabel: baseAxisLabel,
      axisLine: baseAxisLine,
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: baseAxisLabel,
      splitLine: baseSplitLine,
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar', barWidth: '45%',
      data: [820, 1180, 420, 560],
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: function(params) {
          var colorList = [
            new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#16a34a' }, { offset: 1, color: '#bbf7d0' }]),
            new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#0f766e' }, { offset: 1, color: '#6ee7b7' }]),
            new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#f59e0b' }, { offset: 1, color: '#fbbf24' }]),
            new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#92400e' }, { offset: 1, color: '#f59e0b' }])
          ];
          return colorList[params.dataIndex];
        }
      }
    }]
  });

  /* ============================================
     C. 日期时间
     ============================================ */
  var dateTextEl = document.querySelector('.dash-date-text');
  var timeEl = document.querySelector('.dash-time');

  function updateDateTime() {
    var now = new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var d = String(now.getDate()).padStart(2, '0');
    if (dateTextEl) dateTextEl.textContent = y + '年' + m + '月' + d + '日';

    var hh = String(now.getHours()).padStart(2, '0');
    var mm = String(now.getMinutes()).padStart(2, '0');
    var ss = String(now.getSeconds()).padStart(2, '0');
    if (timeEl) timeEl.textContent = hh + ':' + mm + ':' + ss;
  }
  updateDateTime();
  setInterval(updateDateTime, 1000);

  /* ============================================
     C2. 底部数据状态条 — 模拟每 30s 数据刷新时间
     ============================================ */
  var refreshTimeEl = document.getElementById('dash-refresh-time');
  function updateRefreshTime() {
    if (!refreshTimeEl) return;
    var now = new Date();
    var hh = String(now.getHours()).padStart(2, '0');
    var mm = String(now.getMinutes()).padStart(2, '0');
    var ss = String(now.getSeconds()).padStart(2, '0');
    refreshTimeEl.textContent = '更新于 ' + hh + ':' + mm + ':' + ss;
  }
  updateRefreshTime();
  setInterval(updateRefreshTime, 30000);

  /* ============================================
     D. KPI 数字滚动动画
     ============================================ */
  function animateKPI(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    if (isNaN(target)) return;
    var decimal = parseInt(el.getAttribute('data-decimal') || '0', 10);
    var duration = 1500;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = target * eased;
      el.textContent = decimal > 0
        ? current.toFixed(decimal)
        : Math.round(current).toLocaleString('en-US');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function animateKPIsInTab(tabContent) {
    if (!tabContent) return;
    var kpiValues = tabContent.querySelectorAll('.kpi-item-value[data-target]');
    kpiValues.forEach(function(el) { animateKPI(el); });
  }

  // Animate first tab on load
  animateKPIsInTab(document.querySelector('.tab-content.active'));

  /* ============================================
     E. Tab 切换
     ============================================ */
  var tabBtns = document.querySelectorAll('.tab-btn');
  var tabContents = document.querySelectorAll('.tab-content');
  var currentTab = 0;

  function switchTab(index) {
    if (index < 0 || index >= tabBtns.length) return;
    currentTab = index;

    tabBtns.forEach(function(btn, i) {
      btn.classList.toggle('active', i === index);
      btn.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });

    tabContents.forEach(function(content, i) {
      content.classList.toggle('active', i === index);
    });

    // Resize charts in the active tab after a brief delay for display
    setTimeout(function() {
      Object.keys(charts).forEach(function(id) {
        if (charts[id]) charts[id].resize();
      });
    }, 50);

    // Animate KPIs
    animateKPIsInTab(tabContents[index]);
  }

  tabBtns.forEach(function(btn, i) {
    btn.addEventListener('click', function() {
      switchTab(i);
      pauseCarousel();
    });
  });

  // Initialize first tab
  switchTab(0);

  /* ============================================
     F. 全屏切换
     ============================================ */
  var btnFullscreen = document.querySelector('.dash-btn-fullscreen');
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', function() {
      var el = document.documentElement;
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    });
  }

  /* ============================================
     G. 自动轮播 (30秒间隔)
     ============================================ */
  var carouselInterval = null;
  var pauseTimer = null;
  var CAROUSEL_MS = 30000;
  var PAUSE_MS = 30000;

  function startCarousel() {
    stopCarousel();
    carouselInterval = setInterval(function() {
      switchTab((currentTab + 1) % tabBtns.length);
    }, CAROUSEL_MS);
  }

  function stopCarousel() {
    if (carouselInterval) { clearInterval(carouselInterval); carouselInterval = null; }
  }

  function pauseCarousel() {
    stopCarousel();
    if (pauseTimer) clearTimeout(pauseTimer);
    pauseTimer = setTimeout(function() {
      startCarousel();
      pauseTimer = null;
    }, PAUSE_MS);
  }

  startCarousel();

  /* ============================================
     H. Tooltip (hover)
     ============================================ */
  var tooltipEl = document.querySelector('.dash-tooltip');

  function showTooltip(e, text) {
    if (!tooltipEl) return;
    tooltipEl.textContent = text;
    tooltipEl.classList.add('visible');
    positionTooltip(e);
  }

  function positionTooltip(e) {
    if (!tooltipEl) return;
    var x = e.clientX + 12;
    var y = e.clientY - 10;
    var tw = tooltipEl.offsetWidth;
    var th = tooltipEl.offsetHeight;
    if (x + tw > window.innerWidth) x = e.clientX - tw - 8;
    if (y + th > window.innerHeight) y = e.clientY - th - 8;
    if (y < 0) y = 8;
    tooltipEl.style.left = x + 'px';
    tooltipEl.style.top = y + 'px';
  }

  function hideTooltip() {
    if (tooltipEl) tooltipEl.classList.remove('visible');
  }

  document.querySelectorAll('[data-tip]').forEach(function(el) {
    el.addEventListener('mouseenter', function(e) { showTooltip(e, el.getAttribute('data-tip')); });
    el.addEventListener('mousemove', positionTooltip);
    el.addEventListener('mouseleave', hideTooltip);
  });

  /* ============================================
     I. 自动缩放 (1920×1080)
     ============================================ */
  var dashboard = document.querySelector('.dashboard');

  function scaleDashboard() {
    if (!dashboard) return;
    var w = window.innerWidth;
    var h = window.innerHeight;
    if (w < 1200) return; // Let responsive CSS handle small screens
    var scale = Math.min(w / 1920, h / 1080, 1);
    dashboard.style.setProperty('--dash-scale', scale);
    dashboard.style.transform = 'scale(' + scale + ')';
    dashboard.style.transformOrigin = 'top left';
    if (scale < 1) {
      dashboard.style.marginLeft = (w - 1920 * scale) / 2 + 'px';
      dashboard.style.marginTop = (h - 1080 * scale) / 2 + 'px';
    } else {
      dashboard.style.marginLeft = '0';
      dashboard.style.marginTop = '0';
    }
  }
  scaleDashboard();
  window.addEventListener('resize', function() {
    scaleDashboard();
    // Resize all charts
    setTimeout(function() {
      Object.keys(charts).forEach(function(id) {
        if (charts[id]) charts[id].resize();
      });
    }, 100);
  });

  /* ============================================
     J. 键盘导航
     ============================================ */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      switchTab((currentTab - 1 + tabBtns.length) % tabBtns.length);
      pauseCarousel();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      switchTab((currentTab + 1) % tabBtns.length);
      pauseCarousel();
    }
  });

  /* ============================================
     K. 初始 resize (确保图表正确渲染)
     ============================================ */
  setTimeout(function() {
    Object.keys(charts).forEach(function(id) {
      if (charts[id]) charts[id].resize();
    });
  }, 200);

})();
