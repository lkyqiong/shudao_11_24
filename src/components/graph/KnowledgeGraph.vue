<template>
  <div ref="graphContainer" class="knowledge-graph-container"></div>

  <!-- 🎨 右键颜色选择菜单 -->
  <div
    v-if="contextMenu.visible"
    class="color-context-menu"
    :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    @click.stop
  >
    <div class="menu-header">
      {{ contextMenu.nodeLabel }}
      <span class="node-type-badge">{{
        contextMenu.isMainNode ? '主节点' : '属性节点'
      }}</span>
    </div>

    <div class="menu-content">
      <!-- 颜色修改部分 -->
      <div class="menu-section">
        <div class="section-title">🎨 修改颜色</div>
        <label class="color-picker-label">
          {{ getNodeTypeLabel(contextMenu.nodeType) }}
          {{ contextMenu.isMainNode ? '主节点' : '属性节点' }}：
          <input
            type="color"
            :value="getCurrentColor(contextMenu.nodeType, contextMenu.isMainNode)"
            @input="handleColorChange"
            class="color-picker"
          />
        </label>
        <button @click="handleResetColor" class="menu-btn secondary-btn">
          重置为默认颜色
        </button>
      </div>

      <!-- 展开节点部分 -->
      <div class="menu-section">
        <div class="section-title">🔍 展开相关节点</div>

        <!-- 展开数量控制 -->
        <label class="expand-control-label">
          展开数量：
          <input
            type="number"
            v-model.number="contextMenu.expandCount"
            min="1"
            max="20"
            class="expand-count-input"
          />
        </label>

        <!-- 如果是主节点，显示展开方式选择 -->
        <div v-if="contextMenu.isMainNode" class="expand-options">
          <label class="expand-option-label">展开方式：</label>
          <select v-model="contextMenu.expandBy" class="expand-select">
            <option value="author" v-if="contextMenu.nodeType === 'poem'">同作者</option>
            <option value="dynasty" v-if="contextMenu.nodeType === 'poem'">同朝代</option>
            <option value="province" v-if="['poem', 'heritage', 'history'].includes(contextMenu.nodeType)">同省份</option>
            <option value="period" v-if="contextMenu.nodeType === 'history'">同时期</option>
            <option value="type" v-if="contextMenu.nodeType === 'heritage'">同类型</option>
            <option value="province" v-if="contextMenu.nodeType === 'scenic'">同地区</option>
          </select>
        </div>

        <button @click="handleExpandNode" class="menu-btn primary-btn">
          {{ contextMenu.isMainNode ? '展开相关节点' : '展开所有相关内容' }}
        </button>

        <!-- 如果是主节点且是扩展的节点，显示收回按钮 -->
        <button v-if="contextMenu.isMainNode && isExpandedNode(contextMenu.nodeId)" @click="handleCollapseNode" class="menu-btn danger-btn">
          收回此节点
        </button>
      </div>

      <!-- 重置所有展开 -->
      <div class="menu-section">
        <button @click="handleResetExpanded" class="menu-btn warning-btn">
          重置所有展开
        </button>
      </div>

      <button @click="closeContextMenu" class="menu-btn close-btn">关闭</button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import * as echarts from 'echarts';
  import type { ECharts } from 'echarts';

  /**
   * KnowledgeGraph 知识图谱组件
   * 使用 ECharts 实现类似 neo4j 风格的图可视化
   */

  interface GraphNode {
    id: string;
    label: string;
    type: string; // 'poem' | 'heritage' | 'history' | 'scenic'
    data: any; // 原始数据
    comboId?: string; // 所属的 combo ID（仅在独立模式下使用）
  }

  interface GraphEdge {
    source: string;
    target: string;
  }

  interface GraphCombo {
    id: string;
    label: string;
    type: string; // 'poem' | 'heritage' | 'history' | 'scenic'
  }

  interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
    combos?: GraphCombo[]; // combo 数据（仅在独立模式下使用）
  }

  // Props 定义
  interface Props {
    data?: GraphData;
    customColors?: Record<string, { main: string; light: string }>;
    expandedNodeIds?: Set<string>;
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => ({ nodes: [], edges: [] }),
    customColors: () => ({}),
    expandedNodeIds: () => new Set(),
  });

  // Emit 定义
  const emit = defineEmits<{
    nodeClick: [node: GraphNode];
    changeColor: [type: string, isMainNode: boolean, newColor: string];
    expandNode: [nodeId: string, nodeType: string, isMainNode: boolean, expandCount: number, expandBy: string, nodeData: any];
    collapseNode: [nodeId: string, nodeType: string];
    resetExpanded: [];
  }>();

  const graphContainer = ref<HTMLDivElement>();
  let chart: ECharts | null = null;

  // 🎨 右键菜单状态
  const contextMenu = ref({
    visible: false,
    x: 0,
    y: 0,
    nodeType: '',
    isMainNode: false,
    nodeId: '',
    nodeLabel: '',
    nodeData: null as any,
    expandCount: 3, // 展开数量，默认3个
    expandBy: 'author' as 'author' | 'province' | 'type' | 'period' | 'dynasty', // 展开方式
  });

  /**
   * 自定义布局算法：自然分散的核心节点 + 环绕的属性节点
   * （暂时不使用，改用ECharts内置布局）
   */
  const calculateNaturalLayout_deprecated = (nodes: any[], combos: any[]) => {
    const width = graphContainer.value?.offsetWidth || 1200;
    const height = graphContainer.value?.offsetHeight || 800;

    // 距离参数说明：
    // - attrRadius: 核心节点到属性节点的距离（应该 ≤ x）
    // - minCoreDistance: 两个核心节点中心的最小距离
    //   为了 combo 不重叠，需要考虑：minCoreDistance ≥ 2 * (核心半径 + attrRadius + 属性半径 + 间距)
    //   核心节点半径 40，属性节点半径 25，所以 combo 半径约为 40 + attrRadius + 25 = 65 + attrRadius

    const baseDistance = 100; // 基础距离 x
    const attrRadius = baseDistance * 0.7; // 属性节点环绕半径 = 0.7x = 70
    // combo 半径 ≈ 40 + 70 + 25 = 135
    // 为了不重叠：minCoreDistance ≥ 2 * 135 = 270
    // 考虑间距：minCoreDistance = 2.5 * 135 = 337.5 (约 3.4x)
    let minCoreDistance = baseDistance * 3.4; // 核心节点最小距离 = 3.4x = 340

    // 🔧 动态调整：如果画布太小，缩小最小距离以适应
    const minCanvasDimension = Math.min(width, height);
    const requiredRadius = minCoreDistance / (2 * Math.sin(Math.PI / combos.length));
    const maxAllowedRadius = minCanvasDimension * 0.4; // 最大半径不超过画布最小边的40%

    if (requiredRadius > maxAllowedRadius) {
      const adjustedMinDistance = maxAllowedRadius * 2 * Math.sin(Math.PI / combos.length);
      console.warn(`⚠️ 画布太小 (${width}x${height})，自动缩小最小距离: ${Math.round(minCoreDistance)}px → ${Math.round(adjustedMinDistance)}px`);
      minCoreDistance = adjustedMinDistance;
    }

    console.log('📊 布局参数:', {
      baseDistance,
      attrRadius,
      minCoreDistance: Math.round(minCoreDistance),
      comboCount: combos.length,
      canvasSize: { width, height },
      actualWidth: width,
      actualHeight: height
    });

    // 核心节点位置列表
    const corePositions: Array<{ x: number; y: number; comboId: string }> = [];

    // 为每个 combo 分配核心节点位置
    combos.forEach((combo, index) => {
      let x: number, y: number;
      let attempts = 0;
      const maxAttempts = 100;

      // 尝试找到一个不重叠的位置
      do {
        // 使用随机位置，但倾向于分散到各个区域
        // 将画布分为 4 个象限，优先放置在不同象限
        const quadrant = index % 4;
        // 增大偏移范围，让节点更分散
        const offsetX =
          (quadrant % 2 === 0 ? -1 : 1) *
          (width * 0.2 + Math.random() * width * 0.3);
        const offsetY =
          (quadrant < 2 ? -1 : 1) *
          (height * 0.2 + Math.random() * height * 0.3);

        x = width / 2 + offsetX;
        y = height / 2 + offsetY;

        attempts++;

        // 检查是否与已有核心节点距离足够
        const tooClose = corePositions.some((pos) => {
          const dx = pos.x - x;
          const dy = pos.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < minCoreDistance;
        });

        if (!tooClose || attempts >= maxAttempts) {
          break;
        }
      } while (attempts < maxAttempts);

      // 如果实在找不到位置，强制放置（圆形排列）
      if (attempts >= maxAttempts) {
        console.warn(`⚠️ Combo ${index} 尝试${maxAttempts}次失败，使用圆形后备方案`);
        const angle = (index * 2 * Math.PI) / combos.length;
        // 数学正确的圆形排列半径：保证相邻节点距离 ≥ minCoreDistance
        // 公式: radius = minCoreDistance / (2 * sin(π/n))
        const radius = minCoreDistance / (2 * Math.sin(Math.PI / combos.length));
        x = width / 2 + radius * Math.cos(angle);
        y = height / 2 + radius * Math.sin(angle);
        console.log(`  → 圆形布局: 半径=${Math.round(radius)}px, 角度=${Math.round(angle * 180 / Math.PI)}°, 坐标=(${Math.round(x)}, ${Math.round(y)})`);
      }

      corePositions.push({ x, y, comboId: combo.id });

      console.log(`✅ Combo ${index} (${combo.label}) 放置在 (${Math.round(x)}, ${Math.round(y)})`);
    });

    // 验证核心节点之间的距离
    if (corePositions.length > 1) {
      const distances: number[] = [];
      for (let i = 0; i < corePositions.length - 1; i++) {
        for (let j = i + 1; j < corePositions.length; j++) {
          const dx = corePositions[i].x - corePositions[j].x;
          const dy = corePositions[i].y - corePositions[j].y;
          distances.push(Math.sqrt(dx * dx + dy * dy));
        }
      }
      console.log('📏 核心节点间距离:', {
        最小距离: Math.round(Math.min(...distances)),
        最大距离: Math.round(Math.max(...distances)),
        平均距离: Math.round(distances.reduce((a, b) => a + b, 0) / distances.length),
        要求最小距离: minCoreDistance
      });
    }

    // 为节点分配位置
    corePositions.forEach((corePos) => {
      // 找出属于这个 combo 的所有节点
      const comboNodes = nodes.filter((n: any) => n.combo === corePos.comboId);

      // 找出核心节点（主节点）
      const mainNode = comboNodes.find((n: any) =>
        /^(poem|heritage|history|scenic)-\d+$/.test(n.id)
      );

      // 找出属性节点
      const attrNodes = comboNodes.filter((n: any) => n !== mainNode);

      // 设置核心节点位置
      if (mainNode) {
        // 🔧 修复：G6的preset布局需要顶层x,y属性，而不是data.x/data.y
        mainNode.data.x = corePos.x;
        mainNode.data.y = corePos.y;
        mainNode.x = corePos.x;  // ← 添加顶层坐标
        mainNode.y = corePos.y;  // ← 添加顶层坐标
      }

      // 设置属性节点位置（环绕核心节点）
      attrNodes.forEach((node: any, i: number) => {
        const angle = (2 * Math.PI * i) / attrNodes.length;
        const x = corePos.x + attrRadius * Math.cos(angle);
        const y = corePos.y + attrRadius * Math.sin(angle);
        // 🔧 修复：同时设置data和顶层坐标
        node.data.x = x;
        node.data.y = y;
        node.x = x;  // ← 添加顶层坐标
        node.y = y;  // ← 添加顶层坐标
      });

      if (mainNode) {
        console.log(`  ├─ 核心: ${mainNode.label} + ${attrNodes.length} 个属性节点 (半径=${attrRadius}px)`);
        console.log(`     坐标验证: mainNode.x=${mainNode.x}, mainNode.y=${mainNode.y}`);

        // 🔍 验证每个属性节点与核心节点的距离
        attrNodes.forEach((attrNode: any, idx: number) => {
          const dx = attrNode.x - mainNode.x;
          const dy = attrNode.y - mainNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          console.log(`     属性节点[${idx}] ${attrNode.label}: x=${attrNode.x.toFixed(1)}, y=${attrNode.y.toFixed(1)}, 距离=${distance.toFixed(1)}px`);

          if (Math.abs(distance - attrRadius) > 1) {
            console.error(`     ❌ 距离异常！预期=${attrRadius}px, 实际=${distance.toFixed(1)}px`);
          }
        });
      }
    });

    return nodes;
  };

  /**
   * 初始化图实例（使用 ECharts force 布局）
   */
  const initGraph = () => {
    console.log('🚀 initGraph 被调用');
    console.log('  graphContainer.value:', graphContainer.value);
    console.log('  props.data:', props.data);

    if (!graphContainer.value) {
      console.error('❌ graphContainer.value 不存在！');
      return;
    }

    // 清理旧实例
    if (chart) {
      console.log('  清理旧的 chart 实例');
      chart.dispose();
    }

    // 创建 ECharts 实例
    chart = echarts.init(graphContainer.value);
    console.log('✅ ECharts 实例已创建:', chart);

    // 渲染数据
    if (props.data.nodes.length > 0) {
      console.log(`📊 开始渲染 ${props.data.nodes.length} 个节点`);
      // 转换为 ECharts 格式
      const echartsNodes = props.data.nodes.map((node) => {
        const isMainNode = /^(poem|heritage|history|scenic)-\d+$/.test(node.id);
        const color = getNodeColor(node.type, isMainNode);
        const size = isMainNode ? 60 : 40;

        return {
          id: node.id,
          name: node.label,
          symbolSize: size,
          itemStyle: {
            color: color,
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
          label: {
            show: true,
            position: 'inside',
            fontSize: isMainNode ? 13 : 11,
            fontWeight: isMainNode ? 'bold' : 'normal',
            color: '#fff',
            formatter: '{b}',
          },
          category: node.type,
          value: isMainNode ? 100 : 50,
          userData: node.data || node,
        };
      });

      // 转换边数据
      const echartsLinks = props.data.edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        lineStyle: {
          color: '#ccc',
          width: 2,
        },
      }));

      // 定义分类（用于图例）
      const categories = [
        { name: 'poem', itemStyle: { color: '#2E5FA3' } },
        { name: 'heritage', itemStyle: { color: '#2A9D8F' } },
        { name: 'history', itemStyle: { color: '#D4A017' } },
        { name: 'scenic', itemStyle: { color: '#C94A38' } },
      ];

      // 配置 ECharts option（neo4j 风格）
      const option = {
        backgroundColor: '#f9f9f9', // 白色背景
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(50, 50, 50, 0.9)',
          borderColor: '#777',
          textStyle: {
            color: '#fff',
          },
          formatter: (params: any) => {
            if (params.dataType === 'node') {
              return `<strong>${params.name}</strong><br/>类型: ${getNodeTypeLabel(params.data.category)}`;
            }
            return '';
          },
        },
        legend: [{
          orient: 'vertical',
          left: 10,
          top: 10,
          data: [
            { name: 'poem', icon: 'circle' },
            { name: 'heritage', icon: 'circle' },
            { name: 'history', icon: 'circle' },
            { name: 'scenic', icon: 'circle' },
          ],
          textStyle: {
            color: '#333', // 深色文字以适应白色背景
          },
          formatter: (name: string) => getNodeTypeLabel(name),
        }],
        series: [
          {
            type: 'graph',
            layout: 'force', // 使用力导向布局
            data: echartsNodes,
            links: echartsLinks,
            categories: categories,
            roam: true, // 允许缩放和平移
            draggable: true, // 允许拖拽节点
            label: {
              show: true,
              position: 'inside',
            },
            force: {
              repulsion: 300, // 节点之间的斥力
              gravity: 0.1,   // 重力
              edgeLength: 150, // 边的长度
              layoutAnimation: true,
            },
            lineStyle: {
              color: 'source',
              curveness: 0.3,
            },
            emphasis: {
              focus: 'adjacency',
              lineStyle: {
                width: 4,
              },
              itemStyle: {
                shadowBlur: 20,
                shadowColor: 'rgba(255, 255, 255, 0.5)',
              },
            },
          },
        ],
      };

      chart.setOption(option);

      // 监听节点点击事件
      // 左键点击事件
      chart.off('click');
      chart.on('click', (params: any) => {
        console.log('🖱️ ECharts 点击事件触发:', params);
        console.log('  dataType:', params.dataType);

        if (params.dataType === 'node') {
          console.log('✅ 确认点击的是节点');
          const nodeData = params.data.userData;
          console.log('  节点原始数据:', params.data);
          console.log('  userData:', nodeData);

          const emitData = {
            id: params.data.id,
            label: params.data.name,
            type: params.data.category,
            data: nodeData,
          };
          console.log('  准备发送的数据:', emitData);

          emit('nodeClick', emitData);
          console.log('✅ nodeClick 事件已发送');
        } else {
          console.log('❌ 点击的不是节点，是:', params.dataType);
        }
      });

      // 🎨 右键点击事件
      chart.getZr().on('contextmenu', (params: any) => {
        const pointInPixel = [params.offsetX, params.offsetY];
        if (chart && chart.containPixel('grid', pointInPixel)) {
          params.event.preventDefault();
        }
      });

      chart.off('contextmenu');
      chart.on('contextmenu', (params: any) => {
        console.log('🎨 右键点击节点:', params);
        params.event.event.preventDefault(); // 阻止浏览器默认右键菜单

        if (params.dataType === 'node') {
          const isMainNode = /^(poem|heritage|history|scenic)-\d+$/.test(params.data.id);
          const nodeType = params.data.category;

          // 显示右键菜单
          contextMenu.value = {
            visible: true,
            x: params.event.event.clientX,
            y: params.event.event.clientY,
            nodeType: nodeType,
            isMainNode: isMainNode,
            nodeId: params.data.id,
            nodeLabel: params.data.name,
            nodeData: params.data.userData,
            expandCount: 3,
            expandBy: getDefaultExpandBy(nodeType),
          };

          console.log('✅ 右键菜单已显示:', contextMenu.value);
        }
      });

      console.log('✅ ECharts 图谱已渲染');
      console.log(`📊 节点数: ${echartsNodes.length}, 边数: ${echartsLinks.length}`);
      console.log('🖱️ 点击事件已绑定，现在可以点击节点了');
    } else {
      console.warn('⚠️ props.data.nodes 为空，跳过渲染');
    }
  };

  /**
   * 根据节点类型返回颜色（neo4j 风格）
   * @param type 节点类型
   * @param isMainNode 是否是主节点（中心节点）
   */
  const getNodeColor = (type: string, isMainNode: boolean = false): string => {
    // 默认颜色
    const defaultColorMap: Record<string, { main: string; light: string }> = {
      poem: {
        main: '#2E5FA3', // 深蓝色 - 诗词主节点
        light: '#89B5F5', // 浅蓝色 - 诗词属性节点
      },
      heritage: {
        main: '#2A9D8F', // 深绿色 - 非遗主节点
        light: '#8CE0D4', // 浅绿色 - 非遗属性节点
      },
      history: {
        main: '#D4A017', // 深黄色 - 历史主节点
        light: '#F5D576', // 浅黄色 - 历史属性节点
      },
      scenic: {
        main: '#C94A38', // 深橙色 - 景点主节点
        light: '#F59886', // 浅橙色 - 景点属性节点
      },
    };

    // 🎨 优先使用自定义颜色
    const customColor = props.customColors?.[type];
    const colors = customColor || defaultColorMap[type];

    if (!colors) return '#999';

    return isMainNode ? colors.main : colors.light;
  };


  /**
   * 更新图数据（使用 force 布局）
   */
  const updateGraph = (data: GraphData) => {
    if (!chart) return;

    // 转换为 ECharts 格式
    const echartsNodes = data.nodes.map((node) => {
      const isMainNode = /^(poem|heritage|history|scenic)-\d+$/.test(node.id);
      const color = getNodeColor(node.type, isMainNode);
      const size = isMainNode ? 60 : 40;

      return {
        id: node.id,
        name: node.label,
        symbolSize: size,
        itemStyle: {
          color: color,
          borderColor: '#fff',
          borderWidth: 3,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
        },
        label: {
          show: true,
          position: 'inside',
          fontSize: isMainNode ? 13 : 11,
          fontWeight: isMainNode ? 'bold' : 'normal',
          color: '#fff',
          formatter: '{b}',
        },
        category: node.type,
        value: isMainNode ? 100 : 50,
        userData: node.data || node,
      };
    });

    // 转换边数据
    const echartsLinks = data.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      lineStyle: {
        color: '#ccc',
        width: 2,
      },
    }));

    // 定义分类
    const categories = [
      { name: 'poem', itemStyle: { color: '#2E5FA3' } },
      { name: 'heritage', itemStyle: { color: '#2A9D8F' } },
      { name: 'history', itemStyle: { color: '#D4A017' } },
      { name: 'scenic', itemStyle: { color: '#C94A38' } },
    ];

    // 更新 ECharts option
    chart.setOption({
      backgroundColor: '#f9f9f9',
      legend: [{
        orient: 'vertical',
        left: 10,
        top: 10,
        data: [
          { name: 'poem', icon: 'circle' },
          { name: 'heritage', icon: 'circle' },
          { name: 'history', icon: 'circle' },
          { name: 'scenic', icon: 'circle' },
        ],
        textStyle: {
          color: '#333',
        },
        formatter: (name: string) => getNodeTypeLabel(name),
      }],
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: echartsNodes,
          links: echartsLinks,
          categories: categories,
          roam: true,
          draggable: true,
          label: {
            show: true,
            position: 'inside',
          },
          force: {
            repulsion: 300,
            gravity: 0.1,
            edgeLength: 150,
            layoutAnimation: true,
          },
          lineStyle: {
            color: 'source',
            curveness: 0.3,
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 4,
            },
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(255, 255, 255, 0.5)',
            },
          },
        },
      ],
    });

    // 🔥 重要：重新绑定点击事件（因为setOption后需要重新绑定）
    // 左键点击
    chart.off('click');
    chart.on('click', (params: any) => {
      console.log('🖱️ ECharts 点击事件触发:', params);
      console.log('  dataType:', params.dataType);

      if (params.dataType === 'node') {
        console.log('✅ 确认点击的是节点');
        const nodeData = params.data.userData;
        console.log('  节点原始数据:', params.data);
        console.log('  userData:', nodeData);

        const emitData = {
          id: params.data.id,
          label: params.data.name,
          type: params.data.category,
          data: nodeData,
        };
        console.log('  准备发送的数据:', emitData);

        emit('nodeClick', emitData);
        console.log('✅ nodeClick 事件已发送');
      } else {
        console.log('❌ 点击的不是节点，是:', params.dataType);
      }
    });

    // 🎨 右键点击
    chart.off('contextmenu');
    chart.on('contextmenu', (params: any) => {
      console.log('🎨 右键点击节点:', params);
      params.event.event.preventDefault();

      if (params.dataType === 'node') {
        const isMainNode = /^(poem|heritage|history|scenic)-\d+$/.test(params.data.id);
        const nodeType = params.data.category;

        contextMenu.value = {
          visible: true,
          x: params.event.event.clientX,
          y: params.event.event.clientY,
          nodeType: nodeType,
          isMainNode: isMainNode,
          nodeId: params.data.id,
          nodeLabel: params.data.name,
          nodeData: params.data.userData,
          expandCount: 3,
          expandBy: getDefaultExpandBy(nodeType),
        };

        console.log('✅ 右键菜单已显示:', contextMenu.value);
      }
    });

    console.log('✅ 图谱数据已更新，点击事件已重新绑定');
  };

  // 获取节点类型标签
  const getNodeTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      poem: '诗词',
      heritage: '非物质文化遗产',
      history: '历史事件',
      scenic: '旅游景点',
    };
    return typeMap[type] || type;
  };

  // 🎨 获取当前颜色（用于颜色选择器的初始值）
  const getCurrentColor = (type: string, isMainNode: boolean): string => {
    return getNodeColor(type, isMainNode);
  };

  // 🎨 处理颜色变化
  const handleColorChange = (event: Event) => {
    const newColor = (event.target as HTMLInputElement).value;
    emit('changeColor', contextMenu.value.nodeType, contextMenu.value.isMainNode, newColor);
    console.log(`✅ 颜色已修改为: ${newColor}`);
  };

  // 🎨 重置颜色
  const handleResetColor = () => {
    const defaultColors: Record<string, { main: string; light: string }> = {
      poem: { main: '#2E5FA3', light: '#89B5F5' },
      heritage: { main: '#2A9D8F', light: '#8CE0D4' },
      history: { main: '#D4A017', light: '#F5D576' },
      scenic: { main: '#C94A38', light: '#F59886' },
    };

    const type = contextMenu.value.nodeType;
    const isMainNode = contextMenu.value.isMainNode;
    const defaultColor = isMainNode
      ? defaultColors[type].main
      : defaultColors[type].light;

    emit('changeColor', type, isMainNode, defaultColor);
    console.log(`🔄 已重置 ${type} 的颜色`);
    closeContextMenu();
  };

  // 🎨 关闭右键菜单
  const closeContextMenu = () => {
    contextMenu.value.visible = false;
  };

  // 🎨 点击其他地方关闭菜单
  const handleClickOutside = () => {
    if (contextMenu.value.visible) {
      closeContextMenu();
    }
  };

  // 🔍 获取默认的展开方式
  const getDefaultExpandBy = (nodeType: string) => {
    const defaults: Record<string, string> = {
      poem: 'author',
      heritage: 'type',
      history: 'period',
      scenic: 'province',
    };
    return defaults[nodeType] || 'province';
  };

  // 🔍 处理展开节点
  const handleExpandNode = () => {
    console.log('🔍 展开节点:', contextMenu.value);

    emit(
      'expandNode',
      contextMenu.value.nodeId,
      contextMenu.value.nodeType,
      contextMenu.value.isMainNode,
      contextMenu.value.expandCount,
      contextMenu.value.expandBy,
      contextMenu.value.nodeData
    );

    closeContextMenu();
  };

  // 🔙 收回单个节点
  const handleCollapseNode = () => {
    console.log('🔙 收回节点:', contextMenu.value.nodeId);
    emit('collapseNode', contextMenu.value.nodeId, contextMenu.value.nodeType);
    closeContextMenu();
  };

  // 🔄 重置所有展开
  const handleResetExpanded = () => {
    console.log('🔄 重置所有展开');
    emit('resetExpanded');
    closeContextMenu();
  };

  // 🔍 判断是否是扩展的节点
  const isExpandedNode = (nodeId: string): boolean => {
    return props.expandedNodeIds?.has(nodeId) || false;
  };

  // 监听数据变化
  watch(
    () => props.data,
    (newData) => {
      if (newData && chart) {
        updateGraph(newData);
      }
    },
    { deep: true }
  );

  // 🎨 监听自定义颜色变化
  watch(
    () => props.customColors,
    (newColors) => {
      console.log('🎨 检测到颜色变化，重新渲染图表:', newColors);
      if (props.data && chart) {
        updateGraph(props.data);
      }
    },
    { deep: true }
  );

  // 窗口大小变化时重新调整图大小
  const handleResize = () => {
    if (chart) {
      chart.resize();
    }
  };

  onMounted(() => {
    initGraph();
    window.addEventListener('resize', handleResize);
    // 监听全局点击事件，关闭右键菜单
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('click', handleClickOutside);
    if (chart) {
      chart.dispose();
    }
  });

  // 暴露方法
  defineExpose({
    updateGraph,
    chart,
  });
</script>

<style scoped>
  .knowledge-graph-container {
    width: 100%;
    height: 100%;
    background: #f9f9f9; /* 白色背景 */
    border-radius: 8px;
    overflow: hidden;
  }

  /* 🎨 右键菜单样式 */
  .color-context-menu {
    position: fixed;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    min-width: 280px;
    padding: 0;
    overflow: hidden;
  }

  .menu-header {
    background: #5a9090;
    color: white;
    padding: 12px 16px;
    font-weight: bold;
    font-size: 14px;
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .node-type-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: normal;
  }

  .menu-content {
    padding: 16px;
  }

  .color-picker-label {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    font-size: 13px;
    color: #333;
  }

  .color-picker {
    width: 60px;
    height: 36px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .color-picker:hover {
    border-color: #5a9090;
  }

  /* 菜单分区 */
  .menu-section {
    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid #eee;
  }

  .menu-section:last-of-type {
    border-bottom: none;
    margin-bottom: 0;
  }

  .section-title {
    font-size: 13px;
    font-weight: bold;
    color: #5a9090;
    margin-bottom: 10px;
  }

  /* 展开控制 */
  .expand-control-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    font-size: 13px;
    color: #333;
  }

  .expand-count-input {
    width: 60px;
    padding: 4px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
  }

  .expand-options {
    margin-bottom: 10px;
  }

  .expand-option-label {
    display: block;
    font-size: 13px;
    color: #333;
    margin-bottom: 6px;
  }

  .expand-select {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    background: white;
    cursor: pointer;
  }

  /* 按钮样式 */
  .menu-btn {
    width: 100%;
    padding: 8px 12px;
    margin-top: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .primary-btn {
    background: #5a9090;
    color: white;
    border-color: #5a9090;
  }

  .primary-btn:hover {
    background: #4a7f7f;
    border-color: #4a7f7f;
  }

  .secondary-btn {
    background: white;
    color: #333;
  }

  .secondary-btn:hover {
    background: #f0f0f0;
    border-color: #5a9090;
  }

  .close-btn {
    background: white;
    color: #666;
  }

  .close-btn:hover {
    background: #f5f5f5;
  }

  .menu-btn:active {
    transform: scale(0.98);
  }

  .danger-btn {
    background: #ff4d4f;
    color: white;
    border-color: #ff4d4f;
  }

  .danger-btn:hover {
    background: #ff7875;
    border-color: #ff7875;
  }

  .warning-btn {
    background: #faad14;
    color: white;
    border-color: #faad14;
  }

  .warning-btn:hover {
    background: #ffc53d;
    border-color: #ffc53d;
  }
</style>
