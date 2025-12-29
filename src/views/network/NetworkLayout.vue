<template>
  <div class="network-page">
    <!-- ==================== 顶部导航栏 ==================== -->
    <div class="header">
      <div class="logo-section">
        <div class="logo-icon"></div>
        <div class="logo-text">云游蜀道</div>
      </div>

      <div class="nav-menu">
        <div class="nav-item" @click="goToHeritage">古迹篇</div>
        <div class="nav-item" @click="goToScenery">新景篇</div>
        <div class="nav-item active">脉络篇</div>
        <div class="nav-item" @click="goToRoute">行迹篇</div>
      </div>

      <div class="header-right">
        <div class="user-icon" @click="goToProfile">👤</div>
        <button class="home-btn" @click="goToHome">首页</button>
      </div>
    </div>

    <!-- ==================== 主内容区域 ==================== -->
    <div class="main-content">
      <div class="graph-wrapper">
        <!-- 知识图谱组件 -->
        <KnowledgeGraph
          :data="graphData"
          :customColors="customColors"
          :expandedNodeIds="expandedNodeIdsSet"
          @nodeClick="handleNodeClick"
          @changeColor="handleChangeColor"
          @expandNode="handleExpandNode"
          @collapseNode="handleCollapseNode"
          @resetExpanded="handleResetExpanded"
        />

        <!-- 加载提示 -->
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner">加载知识图谱中...</div>
        </div>

        <!-- 控制面板 -->
        <div class="control-panel">
          <!-- 节点数量控制 -->
          <div class="node-limit-control">
            <label>最大节点数：</label>
            <input
              v-model="maxNodesInput"
              @change="handleMaxNodesChange"
              type="text"
              placeholder="3 或 *"
            />
          </div>

          <!-- 筛选面板 -->
          <FilterPanel @filterChange="handleFilterChange" />
        </div>

        <!-- 无结果提示 -->
        <div v-if="!loading && graphData.nodes.length === 0" class="no-results">
          <div class="no-results-content">
            <p>😕 暂无符合筛选条件的数据</p>
            <p class="hint">请尝试调整筛选条件</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 左右边栏 ==================== -->
    <LeftSidebar>
      <div class="sidebar-content">
        <h3>数据统计</h3>
        <div class="stat-item">
          <span>节点总数：</span>
          <strong>{{ graphData.nodes.length }}</strong>
        </div>
        <div class="stat-item">
          <span>连接总数：</span>
          <strong>{{ graphData.edges.length }}</strong>
        </div>
        <div class="stat-section">
          <div class="section-label">筛选后数量：</div>
          <div class="stat-item">
            <span>诗词：</span>
            <strong>{{ filteredCounts.poems }}</strong>
          </div>
          <div class="stat-item">
            <span>非遗：</span>
            <strong>{{ filteredCounts.heritages }}</strong>
          </div>
          <div class="stat-item">
            <span>历史：</span>
            <strong>{{ filteredCounts.histories }}</strong>
          </div>
          <div class="stat-item">
            <span>景点：</span>
            <strong>{{ filteredCounts.scenics }}</strong>
          </div>
        </div>
        <div class="stat-section">
          <div class="section-label">总数据量：</div>
          <div class="stat-item">
            <span>诗词：</span>
            <strong>{{ poems.length }}</strong>
          </div>
          <div class="stat-item">
            <span>非遗：</span>
            <strong>{{ heritages.length }}</strong>
          </div>
          <div class="stat-item">
            <span>历史：</span>
            <strong>{{ histories.length }}</strong>
          </div>
          <div class="stat-item">
            <span>景点：</span>
            <strong>{{ scenics.length }}</strong>
          </div>
        </div>
      </div>
    </LeftSidebar>

    <RightSidebar>
      <div v-if="selectedNode" class="sidebar-content">
        <h3>节点详情</h3>
        <div class="node-detail">
          <!-- 节点颜色指示器 -->
          <div class="node-color-indicator">
            <div
              class="color-box"
              :style="{
                backgroundColor: getNodeDisplayColor(
                  selectedNode.type,
                  selectedNode.id
                ),
              }"
            ></div>
            <span class="color-label">节点颜色</span>
          </div>

          <!-- 基本信息 -->
          <div class="basic-info">
            <p><strong>名称：</strong>{{ selectedNode.label }}</p>
            <p>
              <strong>类型：</strong>{{ getNodeTypeLabel(selectedNode.type) }}
            </p>
            <p><strong>ID：</strong>{{ selectedNode.id }}</p>
          </div>

          <!-- 显示节点的所有属性 -->
          <div v-if="selectedNode.data" class="node-attributes">
            <h4>属性信息</h4>
            <template v-for="(value, key) in selectedNode.data" :key="key">
              <p v-if="shouldShowAttribute(key, value)" class="attribute-item">
                <strong>{{ formatAttributeName(String(key)) }}：</strong>
                <span class="attribute-value">{{
                  formatAttributeValue(value)
                }}</span>
              </p>
            </template>
          </div>
        </div>
      </div>
      <div v-else class="sidebar-content">
        <p style="color: #999; text-align: center; padding: 20px">
          点击图中的节点查看详情
        </p>
      </div>
    </RightSidebar>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import KnowledgeGraph from '@/components/graph/KnowledgeGraph.vue';
  import LeftSidebar from '@/components/common/LeftSidebar.vue';
  import RightSidebar from '@/components/common/RightSidebar.vue';
  import FilterPanel from '@/components/common/FilterPanel.vue';
  import {
    fetchPoems,
    fetchHeritage,
    fetchHistory,
    fetchScenic,
    type Poem,
    type Heritage,
    type History,
    type Scenic,
  } from '@/services/api';
  import { buildGraphData, type GraphNode, type GraphData } from '@/utils/graphBuilder';

  const router = useRouter();

  // 数据状态
  const poems = ref<Poem[]>([]);
  const heritages = ref<Heritage[]>([]);
  const histories = ref<History[]>([]);
  const scenics = ref<Scenic[]>([]);
  const loading = ref(true);
  const selectedNode = ref<GraphNode | null>(null);

  // 节点数量控制
  const maxNodesInput = ref<string>('3');
  const maxNodes = ref<number>(3);

  // 🎨 自定义颜色管理
  const customColors = ref<{
    poem?: { main: string; light: string };
    heritage?: { main: string; light: string };
    history?: { main: string; light: string };
    scenic?: { main: string; light: string };
  }>({});

  // 🔍 已展示的节点ID集合（用于去重）
  const displayedNodeIds = ref<Set<string>>(new Set());

  // 🔍 扩展的节点ID集合（用于判断是否可以收回）
  const expandedNodeIdsSet = ref<Set<string>>(new Set());

  // 🔍 动态添加的节点数据
  const expandedNodes = ref<{
    poems: Poem[];
    heritages: Heritage[];
    histories: History[];
    scenics: Scenic[];
  }>({
    poems: [],
    heritages: [],
    histories: [],
    scenics: [],
  });

  // 筛选条件
  const activeFilters = ref<{
    types: string[];
    name: string;
    province: string;
    city: string;
    county: string;
    place: string;
    author: string;
    people: string;
    dynasty: string;
    period: string;
    rxTime: string;
    poemType: string;
    heritageType: string;
    property: string;
    sightLevel: string;
    score: string;
    price: string;
  }>({
    types: ['poem', 'heritage', 'history', 'scenic'],
    name: '',
    province: '',
    city: '',
    county: '',
    place: '',
    author: '',
    people: '',
    dynasty: '',
    period: '',
    rxTime: '',
    poemType: '',
    heritageType: '',
    property: '',
    sightLevel: '',
    score: '',
    price: '',
  });

  // 处理节点数量输入
  const handleMaxNodesChange = () => {
    const input = maxNodesInput.value.trim();
    if (input === '*') {
      maxNodes.value = Infinity; // 显示全部
    } else {
      const num = parseInt(input);
      if (!isNaN(num) && num > 0) {
        maxNodes.value = num;
      } else {
        maxNodesInput.value = '10';
        maxNodes.value = 10;
      }
    }
  };

  // 处理筛选变化
  const handleFilterChange = (filters: typeof activeFilters.value) => {
    activeFilters.value = filters;
    console.log('✅ 筛选条件已更新:', filters);
  };

  // 应用筛选条件
  const applyFilters = <T extends Poem | Heritage | History | Scenic>(
    data: T[],
    type: 'poem' | 'heritage' | 'history' | 'scenic'
  ): T[] => {
    let filtered = data;

    // 1. 数据类型筛选
    if (!activeFilters.value.types.includes(type)) {
      return [];
    }

    // 2. 名称筛选
    if (activeFilters.value.name) {
      filtered = filtered.filter((item: any) => {
        const name = String(item.name || '').toLowerCase();
        return name.includes(activeFilters.value.name.toLowerCase());
      });
    }

    // 3. 地点筛选（province）
    if (activeFilters.value.province) {
      filtered = filtered.filter((item: any) => {
        const province = String(item.province || '');
        return province === activeFilters.value.province;
      });
    }

    // 3. 城市筛选（city）
    if (activeFilters.value.city) {
      filtered = filtered.filter((item: any) => {
        const city = item.city || '';
        return city === activeFilters.value.city;
      });
    }

    // 4. 县区筛选（county）- 主要用于历史
    if (activeFilters.value.county) {
      filtered = filtered.filter((item: any) => {
        const county = item.county || '';
        return county === activeFilters.value.county;
      });
    }

    // 5. 针对不同类型的特定筛选
    if (type === 'poem') {
      // 作者筛选
      if (activeFilters.value.author) {
        filtered = filtered.filter(
          (item: any) => item.author === activeFilters.value.author
        );
      }
      // 朝代筛选
      if (activeFilters.value.dynasty) {
        filtered = filtered.filter(
          (item: any) => item.dynasty === activeFilters.value.dynasty
        );
      }
      // 诗歌类型筛选
      if (activeFilters.value.poemType) {
        filtered = filtered.filter(
          (item: any) => item.poemtype === activeFilters.value.poemType
        );
      }
    }

    if (type === 'heritage') {
      // 非遗类型筛选
      if (activeFilters.value.heritageType) {
        filtered = filtered.filter(
          (item: any) => item.type === activeFilters.value.heritageType
        );
      }
      // 非遗入选批次筛选
      if (activeFilters.value.rxTime) {
        filtered = filtered.filter(
          (item: any) =>
            String(item.rx_time || '') === activeFilters.value.rxTime
        );
      }
    }

    if (type === 'history') {
      // 历史人物筛选
      if (activeFilters.value.people) {
        filtered = filtered.filter(
          (item: any) => item.people === activeFilters.value.people
        );
      }
      // 历史时期筛选
      if (activeFilters.value.period) {
        filtered = filtered.filter(
          (item: any) => item.period === activeFilters.value.period
        );
      }
      // 历史属性筛选
      if (activeFilters.value.property) {
        filtered = filtered.filter(
          (item: any) => item.property === activeFilters.value.property
        );
      }
    }

    if (type === 'scenic') {
      // 景点地点筛选（place）
      if (activeFilters.value.place) {
        filtered = filtered.filter((item: any) => {
          const place = String(item.place || '').toLowerCase();
          return place.includes(activeFilters.value.place.toLowerCase());
        });
      }
      // 景区等级筛选
      if (activeFilters.value.sightLevel) {
        filtered = filtered.filter(
          (item: any) => item.sight_level === activeFilters.value.sightLevel
        );
      }
      // 景区评分筛选
      if (activeFilters.value.score) {
        filtered = filtered.filter((item: any) => {
          const score = parseFloat(String(item.score || 0));
          const targetScore = parseFloat(activeFilters.value.score);
          return !isNaN(score) && !isNaN(targetScore) && score >= targetScore;
        });
      }
      // 景区价格筛选
      if (activeFilters.value.price) {
        filtered = filtered.filter((item: any) => {
          const price = parseFloat(String(item.price || 0));
          const targetPrice = parseFloat(activeFilters.value.price);
          return !isNaN(price) && !isNaN(targetPrice) && price <= targetPrice;
        });
      }
    }

    return filtered;
  };

  // 计算筛选后的数据数量
  const filteredCounts = computed(() => {
    return {
      poems: applyFilters(poems.value, 'poem').length,
      heritages: applyFilters(heritages.value, 'heritage').length,
      histories: applyFilters(histories.value, 'history').length,
      scenics: applyFilters(scenics.value, 'scenic').length,
    };
  });

  // 计算图数据（固定使用独立模式）
  const graphData = computed(() => {
    // 先应用筛选条件
    const filteredPoems = applyFilters(poems.value, 'poem');
    const filteredHeritages = applyFilters(heritages.value, 'heritage');
    const filteredHistories = applyFilters(histories.value, 'history');
    const filteredScenics = applyFilters(scenics.value, 'scenic');

    if (maxNodes.value === Infinity) {
      // 显示全部筛选后的数据 + 扩展的数据
      return buildGraphData(
        [...filteredPoems, ...expandedNodes.value.poems],
        [...filteredHeritages, ...expandedNodes.value.heritages],
        [...filteredHistories, ...expandedNodes.value.histories],
        [...filteredScenics, ...expandedNodes.value.scenics],
        'independent' // 固定使用独立模式
      );
    }

    // 随机选取总共 maxNodes 个核心节点
    // 1. 合并所有筛选后的数据，标记类型
    const allData: Array<{
      data: any;
      type: 'poem' | 'heritage' | 'history' | 'scenic';
    }> = [
      ...filteredPoems.map((p) => ({ data: p, type: 'poem' as const })),
      ...filteredHeritages.map((h) => ({ data: h, type: 'heritage' as const })),
      ...filteredHistories.map((h) => ({ data: h, type: 'history' as const })),
      ...filteredScenics.map((s) => ({ data: s, type: 'scenic' as const })),
    ];

    // 2. 随机打乱
    const shuffled = [...allData].sort(() => Math.random() - 0.5);

    // 3. 取前 maxNodes 个
    const selected = shuffled.slice(0, maxNodes.value);

    // 4. 按类型分组
    const selectedPoems = selected
      .filter((item) => item.type === 'poem')
      .map((item) => item.data);
    const selectedHeritages = selected
      .filter((item) => item.type === 'heritage')
      .map((item) => item.data);
    const selectedHistories = selected
      .filter((item) => item.type === 'history')
      .map((item) => item.data);
    const selectedScenics = selected
      .filter((item) => item.type === 'scenic')
      .map((item) => item.data);

    // 🔍 合并扩展的节点
    const finalPoems = [...selectedPoems, ...expandedNodes.value.poems];
    const finalHeritages = [...selectedHeritages, ...expandedNodes.value.heritages];
    const finalHistories = [...selectedHistories, ...expandedNodes.value.histories];
    const finalScenics = [...selectedScenics, ...expandedNodes.value.scenics];

    // 构建图数据（固定使用独立模式）
    return buildGraphData(
      finalPoems,
      finalHeritages,
      finalHistories,
      finalScenics,
      'independent' // 固定使用独立模式
    );
  });

  // 加载所有数据
  const loadAllData = async () => {
    loading.value = true;
    try {
      const [poemsData, heritagesData, historiesData, scenicsData] =
        await Promise.all([
          fetchPoems(),
          fetchHeritage(),
          fetchHistory(),
          fetchScenic(),
        ]);

      poems.value = poemsData;
      heritages.value = heritagesData;
      histories.value = historiesData;
      scenics.value = scenicsData;

      // 🔍 初始化已展示节点ID集合
      displayedNodeIds.value.clear();
      graphData.value.nodes.forEach(node => {
        // 只记录主节点ID
        if (/^(poem|heritage|history|scenic)-\d+$/.test(node.id)) {
          displayedNodeIds.value.add(node.id);
        }
      });

      console.log('✅ 知识图谱数据加载完成');
      console.log(`节点数：${graphData.value.nodes.length}`);
      console.log(`边数：${graphData.value.edges.length}`);
      console.log(`已展示主节点数：${displayedNodeIds.value.size}`);
    } catch (error) {
      console.error('❌ 加载知识图谱数据失败：', error);
    } finally {
      loading.value = false;
    }
  };

  // 节点点击事件
  const handleNodeClick = (node: GraphNode) => {
    selectedNode.value = node;

    console.log('=== 点击节点详情 ===');
    console.log('节点ID:', node.id);
    console.log('节点名称:', node.label);
    console.log('节点类型:', node.type);
    console.log('节点数据:', node.data);
    console.log('节点完整对象:', node);
    console.log('===================');
  };

  // 🎨 修改节点颜色事件
  const handleChangeColor = (type: string, isMainNode: boolean, newColor: string) => {
    console.log(`🎨 修改 ${type} 类型的${isMainNode ? '主' : '属性'}节点颜色为:`, newColor);

    if (!customColors.value[type as keyof typeof customColors.value]) {
      // 如果该类型还没有自定义颜色，使用默认颜色初始化
      const defaultColors = getDefaultColors();
      customColors.value[type as keyof typeof customColors.value] = {
        main: defaultColors[type as keyof typeof defaultColors].main,
        light: defaultColors[type as keyof typeof defaultColors].light
      };
    }

    // 更新颜色
    if (isMainNode) {
      customColors.value[type as keyof typeof customColors.value]!.main = newColor;
    } else {
      customColors.value[type as keyof typeof customColors.value]!.light = newColor;
    }

    console.log('✅ 颜色已更新:', customColors.value);
  };

  // 获取默认颜色配置
  const getDefaultColors = () => ({
    poem: { main: '#2E5FA3', light: '#89B5F5' },
    heritage: { main: '#2A9D8F', light: '#8CE0D4' },
    history: { main: '#D4A017', light: '#F5D576' },
    scenic: { main: '#C94A38', light: '#F59886' },
  });

  // 🔄 重置某个类型的颜色
  const resetTypeColor = (type: string) => {
    delete customColors.value[type as keyof typeof customColors.value];
    console.log(`🔄 已重置 ${type} 的颜色`);
  };

  // 🔍 展开节点
  const handleExpandNode = (
    nodeId: string,
    nodeType: string,
    isMainNode: boolean,
    expandCount: number,
    expandBy: string,
    nodeData: any
  ) => {
    console.log('🔍 handleExpandNode 被调用:', {
      nodeId,
      nodeType,
      isMainNode,
      expandCount,
      expandBy,
      nodeData,
    });

    if (isMainNode) {
      // 右击的是主节点：按照指定方式展开相关节点
      expandFromMainNode(nodeId, nodeType, expandCount, expandBy, nodeData);
    } else {
      // 右击的是属性节点：展开所有共享该属性的主节点
      expandFromAttributeNode(nodeId, nodeType, expandCount, nodeData);
    }
  };

  // 🔍 从主节点展开
  const expandFromMainNode = (
    nodeId: string,
    nodeType: string,
    expandCount: number,
    expandBy: string,
    nodeData: any
  ) => {
    console.log(`🔍 从主节点展开 ${nodeType} (${expandBy})`);

    // 获取筛选条件
    const filterValue = nodeData[expandBy];
    if (!filterValue) {
      console.warn(`⚠️ 节点没有 ${expandBy} 属性`);
      return;
    }

    console.log(`  筛选条件: ${expandBy} = ${filterValue}`);

    // 根据类型筛选数据
    let candidates: any[] = [];
    switch (nodeType) {
      case 'poem':
        candidates = poems.value.filter((p: Poem) => p[expandBy as keyof Poem] === filterValue && `poem-${p.id}` !== nodeId);
        break;
      case 'heritage':
        candidates = heritages.value.filter((h: Heritage) => h[expandBy as keyof Heritage] === filterValue && `heritage-${h.id}` !== nodeId);
        break;
      case 'history':
        candidates = histories.value.filter((h: History) => h[expandBy as keyof History] === filterValue && `history-${h.id}` !== nodeId);
        break;
      case 'scenic':
        candidates = scenics.value.filter((s: Scenic) => s[expandBy as keyof Scenic] === filterValue && `scenic-${s.id}` !== nodeId);
        break;
    }

    console.log(`  找到 ${candidates.length} 个候选节点`);

    // 过滤掉已经展示的节点
    const newCandidates = candidates.filter((item: any) => {
      const id = `${nodeType}-${item.id}`;
      return !displayedNodeIds.value.has(id);
    });

    console.log(`  其中 ${newCandidates.length} 个是新节点`);

    // 随机选取指定数量
    const shuffled = [...newCandidates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, expandCount);

    console.log(`  最终选择 ${selected.length} 个节点展开`);

    // 添加到扩展节点
    if (selected.length > 0) {
      switch (nodeType) {
        case 'poem':
          expandedNodes.value.poems.push(...selected);
          break;
        case 'heritage':
          expandedNodes.value.heritages.push(...selected);
          break;
        case 'history':
          expandedNodes.value.histories.push(...selected);
          break;
        case 'scenic':
          expandedNodes.value.scenics.push(...selected);
          break;
      }

      // 更新已展示节点集合和扩展节点集合
      selected.forEach((item: any) => {
        const nodeId = `${nodeType}-${item.id}`;
        displayedNodeIds.value.add(nodeId);
        expandedNodeIdsSet.value.add(nodeId); // 标记为扩展节点
      });

      console.log(`✅ 已添加 ${selected.length} 个 ${nodeType} 节点`);
    } else {
      console.warn(`⚠️ 没有找到可展开的节点`);
    }
  };

  // 🔍 从属性节点展开
  const expandFromAttributeNode = (
    nodeId: string,
    nodeType: string,
    expandCount: number,
    nodeData: any
  ) => {
    console.log(`🔍 从属性节点展开: ${nodeId}`, nodeData);

    // 解析属性节点ID，获取属性名
    // 独立模式格式: "poemtype-文-poem-5000"
    // 网络模式格式: "author-李白"
    const parts = nodeId.split('-');
    if (parts.length < 2) {
      console.error('❌ 无效的属性节点ID:', nodeId);
      return;
    }

    const attributeName = parts[0];

    // 🔧 修复：从 nodeData.label 获取真实的属性值，而不是从ID解析
    // nodeData.label 包含了属性的实际显示值
    let attributeValue = nodeData?.label || parts[1];

    // 如果label以"省份"开头，去掉前缀
    if (attributeValue.startsWith('省份')) {
      attributeValue = attributeValue.replace('省份', '');
    }
    // 如果label以"评分"开头，去掉前缀
    if (attributeValue.startsWith('评分')) {
      attributeValue = attributeValue.replace('评分', '');
    }

    console.log(`  属性: ${attributeName} = ${attributeValue}`);

    // 收集所有类型的候选节点
    const allCandidates: Array<{ data: any; type: 'poem' | 'heritage' | 'history' | 'scenic' }> = [];

    // 诗词
    const poemMatches = poems.value.filter((p: Poem) => {
      const poemId = `poem-${p.id}`;
      if (displayedNodeIds.value.has(poemId)) return false;

      // 根据属性名匹配
      switch (attributeName) {
        case 'author':
          return p.author === attributeValue;
        case 'dynasty':
          return p.dynasty === attributeValue;
        case 'province':
          return String(p.province) === attributeValue;
        case 'city':
          return p.city === attributeValue;
        case 'poemtype':
          return p.poemtype === attributeValue;
        default:
          return false;
      }
    });
    allCandidates.push(...poemMatches.map(p => ({ data: p, type: 'poem' as const })));

    // 非遗
    const heritageMatches = heritages.value.filter((h: Heritage) => {
      const heritageId = `heritage-${h.id}`;
      if (displayedNodeIds.value.has(heritageId)) return false;

      switch (attributeName) {
        case 'province':
          return String(h.province) === attributeValue;
        case 'heritage_type':
        case 'type':
          return h.type === attributeValue;
        case 'rx_time':
          return h.rx_time === attributeValue;
        default:
          return false;
      }
    });
    allCandidates.push(...heritageMatches.map(h => ({ data: h, type: 'heritage' as const })));

    // 历史
    const historyMatches = histories.value.filter((h: History) => {
      const historyId = `history-${h.id}`;
      if (displayedNodeIds.value.has(historyId)) return false;

      switch (attributeName) {
        case 'province':
          return String(h.province) === attributeValue;
        case 'city':
          return h.city === attributeValue;
        case 'people':
          return h.people === attributeValue;
        case 'period':
          return h.period === attributeValue;
        case 'property':
          return h.property === attributeValue;
        default:
          return false;
      }
    });
    allCandidates.push(...historyMatches.map(h => ({ data: h, type: 'history' as const })));

    // 景点
    const scenicMatches = scenics.value.filter((s: Scenic) => {
      const scenicId = `scenic-${s.id}`;
      if (displayedNodeIds.value.has(scenicId)) return false;

      switch (attributeName) {
        case 'province':
        case 'place':
          return String(s.place).toLowerCase().includes(attributeValue.toLowerCase());
        case 'sight_level':
          return s.sight_level === attributeValue;
        default:
          return false;
      }
    });
    allCandidates.push(...scenicMatches.map(s => ({ data: s, type: 'scenic' as const })));

    console.log(`  找到 ${allCandidates.length} 个候选节点`);

    // 随机选取
    const shuffled = [...allCandidates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, expandCount);

    console.log(`  最终选择 ${selected.length} 个节点展开`);

    // 按类型分组添加
    if (selected.length > 0) {
      selected.forEach(item => {
        const nodeId = `${item.type}-${item.data.id}`;
        switch (item.type) {
          case 'poem':
            expandedNodes.value.poems.push(item.data);
            displayedNodeIds.value.add(nodeId);
            expandedNodeIdsSet.value.add(nodeId); // 标记为扩展节点
            break;
          case 'heritage':
            expandedNodes.value.heritages.push(item.data);
            displayedNodeIds.value.add(nodeId);
            expandedNodeIdsSet.value.add(nodeId);
            break;
          case 'history':
            expandedNodes.value.histories.push(item.data);
            displayedNodeIds.value.add(nodeId);
            expandedNodeIdsSet.value.add(nodeId);
            break;
          case 'scenic':
            expandedNodes.value.scenics.push(item.data);
            displayedNodeIds.value.add(nodeId);
            expandedNodeIdsSet.value.add(nodeId);
            break;
        }
      });

      console.log(`✅ 已展开 ${selected.length} 个节点 (诗词:${selected.filter(i=>i.type==='poem').length}, 非遗:${selected.filter(i=>i.type==='heritage').length}, 历史:${selected.filter(i=>i.type==='history').length}, 景点:${selected.filter(i=>i.type==='scenic').length})`);
    } else {
      console.warn(`⚠️ 没有找到可展开的节点`);
    }
  };

  // 🔙 收回单个节点
  const handleCollapseNode = (nodeId: string, nodeType: string) => {
    console.log(`🔙 收回节点: ${nodeId}`);

    // 从扩展节点中移除
    const id = parseInt(nodeId.split('-')[1]);

    switch (nodeType) {
      case 'poem':
        expandedNodes.value.poems = expandedNodes.value.poems.filter(p => p.id !== id);
        break;
      case 'heritage':
        expandedNodes.value.heritages = expandedNodes.value.heritages.filter(h => h.id !== id);
        break;
      case 'history':
        expandedNodes.value.histories = expandedNodes.value.histories.filter(h => h.id !== id);
        break;
      case 'scenic':
        expandedNodes.value.scenics = expandedNodes.value.scenics.filter(s => s.id !== id);
        break;
    }

    // 从集合中移除
    displayedNodeIds.value.delete(nodeId);
    expandedNodeIdsSet.value.delete(nodeId);

    console.log(`✅ 已收回节点: ${nodeId}`);
  };

  // 🔄 重置所有展开
  const handleResetExpanded = () => {
    console.log('🔄 重置所有展开');

    // 清空扩展节点
    expandedNodes.value = {
      poems: [],
      heritages: [],
      histories: [],
      scenics: [],
    };

    // 清空扩展节点ID集合
    expandedNodeIdsSet.value.clear();

    // 重新初始化displayedNodeIds（只保留初始节点）
    displayedNodeIds.value.clear();
    graphData.value.nodes.forEach(node => {
      if (/^(poem|heritage|history|scenic)-\d+$/.test(node.id)) {
        displayedNodeIds.value.add(node.id);
      }
    });

    console.log('✅ 已重置所有展开');
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

  // 获取节点显示颜色（与知识图谱中的颜色一致）
  const getNodeDisplayColor = (type: string, id: string): string => {
    // 判断是否是主节点（中心节点）
    const isMainNode = /^(poem|heritage|history|scenic)-\d+$/.test(id);

    const colorMap: Record<string, { main: string; light: string }> = {
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

    const colors = colorMap[type];
    if (!colors) return '#999';

    return isMainNode ? colors.main : colors.light;
  };

  // 判断是否应该显示该属性
  const shouldShowAttribute = (key: any, value: any): boolean => {
    const keyStr = String(key);
    const excludedKeys = ['x', 'y', 'id', 'label', 'nodeType'];
    if (excludedKeys.includes(keyStr)) return false;
    if (value === null || value === undefined || value === '') return false;
    return true;
  };

  // 格式化属性名称
  const formatAttributeName = (key: string): string => {
    const nameMap: Record<string, string> = {
      name: '名称',
      author: '作者',
      dynasty: '朝代',
      content: '内容',
      keywords: '关键词',
      poemtype: '诗歌类型',
      city: '城市',
      county: '县区',
      province: '省份',
      longitude: '经度',
      latitude: '纬度',
      rx_time: '入选批次',
      type: '类型',
      people: '人物',
      description: '描述',
      property: '属性',
      period: '时期',
      place: '地点',
      score: '评分',
      sight_level: '景区等级',
      price: '价格',
    };
    return nameMap[key] || key;
  };

  // 格式化属性值
  const formatAttributeValue = (value: any): string => {
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'string') {
      // 如果内容太长，截取前100个字符
      if (value.length > 100) {
        return value.substring(0, 100) + '...';
      }
      return value;
    }
    return String(value);
  };

  onMounted(() => {
    loadAllData();
  });

  const goToHome = () => router.push('/home');
  const goToProfile = () => router.push('/profile');
  const goToHeritage = () => router.push('/heritage');
  const goToScenery = () => router.push('/scenery');
  const goToRoute = () => router.push('/route');
</script>

<style scoped>
  .network-page {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
  }

  .header {
    background: #5a9090;
    padding: 1vh 3vw;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    height: 8vh;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 1vw;
  }

  .logo-icon {
    width: 3vw;
    height: 3vw;
    background: white;
    border-radius: 5px;
    background-image: url('@/assets/images/logo.png');
    background-size: cover;
    background-position: center;
  }

  .logo-text {
    font-size: 1.8vw;
    color: white;
    font-weight: bold;
  }

  .nav-menu {
    display: flex;
    gap: 2.5vw;
  }

  .nav-item {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.2vw;
    cursor: pointer;
    transition: all 0.3s;
  }

  .nav-item.active {
    color: white;
    font-weight: bold;
  }

  .nav-item:hover {
    color: white;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1.5vw;
  }

  .ai-btn {
    background: white;
    border-radius: 50%;
    width: 3.5vw;
    height: 3.5vw;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1vw;
    color: #5a9090;
    cursor: pointer;
    font-weight: bold;
  }

  .search-box {
    width: 20vw;
    padding: 0.8vh 1.5vw;
    border: none;
    border-radius: 25px;
    font-size: 0.9vw;
    outline: none;
  }

  .user-icon {
    width: 3.5vw;
    height: 3.5vw;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.8vw;
    color: #5a9090;
  }

  .home-btn {
    background: white;
    color: #5a9090;
    padding: 0.8vh 2vw;
    border: none;
    border-radius: 20px;
    font-size: 1vw;
    cursor: pointer;
    font-weight: bold;
  }

  .main-content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.1vh 0.1vw; /* 极小边距，防止边缘贴边 */
    position: relative;
  }

  .graph-wrapper {
    width: 100%; /* 完全填充宽度 */
    height: 100%; /* 完全填充高度 */
    position: relative;
  }

  /* ==================== 加载提示 ==================== */
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .loading-spinner {
    font-size: 1.5vw;
    color: #5a9090;
    padding: 2vh 4vw;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  /* ==================== 控制面板 ==================== */
  .control-panel {
    position: absolute;
    top: 2vh;
    right: 2vw;
    background: white;
    padding: 1.5vh 2vw;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 100;
    min-width: 280px;
    max-width: 350px;
    max-height: 80vh;
    overflow-y: auto;
  }

  /* ==================== 节点数量控制 ==================== */
  .node-limit-control {
    margin-bottom: 1.5vh;
    padding-bottom: 1.5vh;
    border-bottom: 1px solid #eee;
  }

  .node-limit-control label {
    font-size: 12px;
    color: #333;
    display: block;
    margin-bottom: 0.5vh;
    font-weight: bold;
  }

  .node-limit-control input {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    outline: none;
  }

  .node-limit-control input:focus {
    border-color: #5a9090;
  }

  /* ==================== 无结果提示 ==================== */
  .no-results {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 50;
  }

  .no-results-content {
    background: white;
    padding: 3vh 4vw;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  }

  .no-results-content p {
    font-size: 1.2vw;
    color: #666;
    margin: 1vh 0;
  }

  .no-results-content .hint {
    font-size: 0.9vw;
    color: #999;
  }

  /* ==================== 边栏内容 ==================== */
  .sidebar-content {
    padding: 2vh 1vw;
  }

  .sidebar-content h3 {
    font-size: 1.2vw;
    margin-bottom: 2vh;
    color: #333;
    border-bottom: 2px solid #5a9090;
    padding-bottom: 1vh;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    padding: 1vh 0;
    border-bottom: 1px solid #eee;
    font-size: 1vw;
  }

  .stat-item strong {
    color: #5a9090;
  }

  .stat-section {
    margin-top: 2vh;
    padding-top: 2vh;
    border-top: 2px solid #eee;
  }

  .section-label {
    font-size: 0.95vw;
    color: #666;
    font-weight: bold;
    margin-bottom: 1vh;
  }

  .stat-section .stat-item {
    font-size: 0.9vw;
    padding: 0.8vh 0;
  }

  .node-detail {
    font-size: 13px;
    line-height: 1.6;
  }

  .node-detail p {
    margin-bottom: 8px;
    word-break: break-word;
  }

  /* 节点颜色指示器 */
  .node-color-indicator {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 6px;
    margin-bottom: 16px;
  }

  .color-box {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .color-label {
    font-size: 12px;
    color: #666;
    font-weight: bold;
  }

  /* 基本信息 */
  .basic-info {
    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 2px solid #eee;
  }

  .basic-info p {
    font-size: 13px;
    margin-bottom: 6px;
  }

  /* 属性信息 */
  .node-attributes {
    margin-top: 12px;
  }

  .node-attributes h4 {
    font-size: 14px;
    color: #5a9090;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 2px solid #5a9090;
  }

  .attribute-item {
    padding: 6px 0;
    border-bottom: 1px solid #f0f0f0;
    font-size: 12px;
  }

  .attribute-item:last-child {
    border-bottom: none;
  }

  .attribute-item strong {
    color: #333;
    display: inline-block;
    min-width: 80px;
  }

  .attribute-value {
    color: #666;
    word-break: break-word;
  }
</style>
