/**
 * 图数据构建工具
 * 将数据库数据转换为知识图谱的节点和边
 */

import type { Poem, Heritage, History, Scenic } from '@/services/api';

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  data: any;
  comboId?: string; // 所属的 combo ID（仅在独立模式下使用）
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphCombo {
  id: string;
  label: string;
  type: string; // 'poem' | 'heritage' | 'history' | 'scenic'
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  combos?: GraphCombo[]; // combo 数据（仅在独立模式下使用）
}

/**
 * 检查值是否有效（非空、非NaN、非undefined）
 */
function isValidValue(value: any): boolean {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'string' && (value === 'NaN' || value.toLowerCase() === 'nan')) return false;
  if (typeof value === 'number' && isNaN(value)) return false;
  return true;
}

/**
 * 构建知识图谱数据
 * @param poems 诗词数据
 * @param heritages 非遗数据
 * @param histories 历史数据
 * @param scenics 景点数据
 * @param mode 数据模式：'network' 网络模式（属性节点共享），'independent' 独立模式（每个中心节点有独立的属性节点）
 * @returns 图数据（节点和边）
 */
export function buildGraphData(
  poems: Poem[],
  heritages: Heritage[],
  histories: History[],
  scenics: Scenic[],
  mode: 'network' | 'independent' = 'network'
): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>(); // 用于去重
  const combos: GraphCombo[] = []; // combo 数据（仅在独立模式下使用）

  // 1. 创建诗词节点
  poems.forEach((poem) => {
    // 主节点：诗词名称
    const poemId = `poem-${poem.id}`;

    // 独立模式：为每个诗词创建一个 combo
    if (mode === 'independent') {
      combos.push({
        id: `combo-${poemId}`,
        label: poem.name,
        type: 'poem',
      });
    }

    nodes.push({
      id: poemId,
      label: poem.name,
      type: 'poem',
      data: poem,
      comboId: mode === 'independent' ? `combo-${poemId}` : undefined,
    });

    // 创建属性节点并建立连接
    const comboId = mode === 'independent' ? `combo-${poemId}` : undefined;

    if (isValidValue(poem.author)) {
      const authorId = mode === 'independent'
        ? `author-${poem.author}-${poemId}`
        : `author-${poem.author}`;
      addNodeIfNotExists(nodes, authorId, poem.author, 'poem', mode, comboId);
      addEdge(edges, edgeSet, poemId, authorId);
    }

    if (isValidValue(poem.dynasty)) {
      const dynastyId = mode === 'independent'
        ? `dynasty-${poem.dynasty}-${poemId}`
        : `dynasty-${poem.dynasty}`;
      addNodeIfNotExists(nodes, dynastyId, poem.dynasty, 'poem', mode, comboId);
      addEdge(edges, edgeSet, poemId, dynastyId);
    }

    if (isValidValue(poem.poemtype)) {
      const typeId = mode === 'independent'
        ? `poemtype-${poem.poemtype}-${poemId}`
        : `poemtype-${poem.poemtype}`;
      addNodeIfNotExists(nodes, typeId, poem.poemtype, 'poem', mode, comboId);
      addEdge(edges, edgeSet, poemId, typeId);
    }

    // 地理位置连接
    if (isValidValue(poem.province)) {
      const provinceId = mode === 'independent'
        ? `province-${poem.province}-${poemId}`
        : `province-${poem.province}`;
      addNodeIfNotExists(nodes, provinceId, `省份${poem.province}`, 'poem', mode, comboId);
      addEdge(edges, edgeSet, poemId, provinceId);
    }

    if (isValidValue(poem.city)) {
      const cityId = mode === 'independent'
        ? `city-${poem.city}-${poemId}`
        : `city-${poem.city}`;
      addNodeIfNotExists(nodes, cityId, poem.city, 'poem', mode, comboId);
      addEdge(edges, edgeSet, poemId, cityId);
    }

    if (isValidValue(poem.county)) {
      const countyId = mode === 'independent'
        ? `county-${poem.county}-${poemId}`
        : `county-${poem.county}`;
      addNodeIfNotExists(nodes, countyId, poem.county, 'poem', mode, comboId);
      addEdge(edges, edgeSet, poemId, countyId);
    }

    // 关键词连接
    if (isValidValue(poem.keywords)) {
      const keywordId = mode === 'independent'
        ? `keyword-${poem.keywords}-${poemId}`
        : `keyword-${poem.keywords}`;
      addNodeIfNotExists(nodes, keywordId, poem.keywords, 'poem', mode, comboId);
      addEdge(edges, edgeSet, poemId, keywordId);
    }
  });

  // 2. 创建非遗节点
  heritages.forEach((heritage) => {
    const heritageId = `heritage-${heritage.id}`;

    // 独立模式：为每个非遗创建一个 combo
    if (mode === 'independent') {
      combos.push({
        id: `combo-${heritageId}`,
        label: heritage.name,
        type: 'heritage',
      });
    }

    nodes.push({
      id: heritageId,
      label: heritage.name,
      type: 'heritage',
      data: heritage,
      comboId: mode === 'independent' ? `combo-${heritageId}` : undefined,
    });

    const comboId = mode === 'independent' ? `combo-${heritageId}` : undefined;

    if (heritage.rx_time) {
      const timeId = mode === 'independent'
        ? `rx_time-${heritage.rx_time}-${heritageId}`
        : `rx_time-${heritage.rx_time}`;
      addNodeIfNotExists(nodes, timeId, heritage.rx_time, 'heritage', mode, comboId);
      addEdge(edges, edgeSet, heritageId, timeId);
    }

    if (heritage.type) {
      const typeId = mode === 'independent'
        ? `heritage_type-${heritage.type}-${heritageId}`
        : `heritage_type-${heritage.type}`;
      addNodeIfNotExists(nodes, typeId, heritage.type, 'heritage', mode, comboId);
      addEdge(edges, edgeSet, heritageId, typeId);
    }

    if (heritage.province) {
      const provinceId = mode === 'independent'
        ? `province-${heritage.province}-${heritageId}`
        : `province-${heritage.province}`;
      addNodeIfNotExists(nodes, provinceId, `省份${heritage.province}`, 'heritage', mode, comboId);
      addEdge(edges, edgeSet, heritageId, provinceId);
    }
  });

  // 3. 创建历史节点
  histories.forEach((history) => {
    const historyId = `history-${history.id}`;

    // 独立模式：为每个历史事件创建一个 combo
    if (mode === 'independent') {
      combos.push({
        id: `combo-${historyId}`,
        label: history.name,
        type: 'history',
      });
    }

    nodes.push({
      id: historyId,
      label: history.name,
      type: 'history',
      data: history,
      comboId: mode === 'independent' ? `combo-${historyId}` : undefined,
    });

    const comboId = mode === 'independent' ? `combo-${historyId}` : undefined;

    if (history.people) {
      const peopleId = mode === 'independent'
        ? `people-${history.people}-${historyId}`
        : `people-${history.people}`;
      addNodeIfNotExists(nodes, peopleId, history.people, 'history', mode, comboId);
      addEdge(edges, edgeSet, historyId, peopleId);
    }

    if (history.property) {
      const propertyId = mode === 'independent'
        ? `property-${history.property}-${historyId}`
        : `property-${history.property}`;
      addNodeIfNotExists(nodes, propertyId, history.property, 'history', mode, comboId);
      addEdge(edges, edgeSet, historyId, propertyId);
    }

    if (history.period) {
      const periodId = mode === 'independent'
        ? `period-${history.period}-${historyId}`
        : `period-${history.period}`;
      addNodeIfNotExists(nodes, periodId, history.period, 'history', mode, comboId);
      addEdge(edges, edgeSet, historyId, periodId);
    }

    if (history.province) {
      const provinceId = mode === 'independent'
        ? `province-${history.province}-${historyId}`
        : `province-${history.province}`;
      addNodeIfNotExists(nodes, provinceId, `省份${history.province}`, 'history', mode, comboId);
      addEdge(edges, edgeSet, historyId, provinceId);
    }

    if (history.city) {
      const cityId = mode === 'independent'
        ? `city-${history.city}-${historyId}`
        : `city-${history.city}`;
      addNodeIfNotExists(nodes, cityId, history.city, 'history', mode, comboId);
      addEdge(edges, edgeSet, historyId, cityId);
    }

    if (history.county) {
      const countyId = mode === 'independent'
        ? `county-${history.county}-${historyId}`
        : `county-${history.county}`;
      addNodeIfNotExists(nodes, countyId, history.county, 'history', mode, comboId);
      addEdge(edges, edgeSet, historyId, countyId);
    }
  });

  // 4. 创建景点节点
  scenics.forEach((scenic) => {
    const scenicId = `scenic-${scenic.id}`;

    // 独立模式：为每个景点创建一个 combo
    if (mode === 'independent') {
      combos.push({
        id: `combo-${scenicId}`,
        label: scenic.name,
        type: 'scenic',
      });
    }

    nodes.push({
      id: scenicId,
      label: scenic.name,
      type: 'scenic',
      data: scenic,
      comboId: mode === 'independent' ? `combo-${scenicId}` : undefined,
    });

    const comboId = mode === 'independent' ? `combo-${scenicId}` : undefined;

    if (scenic.sight_level) {
      const levelId = mode === 'independent'
        ? `sight_level-${scenic.sight_level}-${scenicId}`
        : `sight_level-${scenic.sight_level}`;
      addNodeIfNotExists(nodes, levelId, scenic.sight_level, 'scenic', mode, comboId);
      addEdge(edges, edgeSet, scenicId, levelId);
    }

    if (scenic.place) {
      const placeId = mode === 'independent'
        ? `place-${scenic.place}-${scenicId}`
        : `place-${scenic.place}`;
      addNodeIfNotExists(nodes, placeId, scenic.place, 'scenic', mode, comboId);
      addEdge(edges, edgeSet, scenicId, placeId);
    }

    if (scenic.score) {
      const scoreId = mode === 'independent'
        ? `score-${Math.floor(scenic.score)}-${scenicId}`
        : `score-${Math.floor(scenic.score)}`;
      addNodeIfNotExists(nodes, scoreId, `评分${Math.floor(scenic.score)}`, 'scenic', mode, comboId);
      addEdge(edges, edgeSet, scenicId, scoreId);
    }

    if (scenic.price !== undefined && scenic.price !== null) {
      const priceId = mode === 'independent'
        ? `price-${scenic.price > 0 ? '收费' : '免费'}-${scenicId}`
        : `price-${scenic.price > 0 ? '收费' : '免费'}`;
      addNodeIfNotExists(
        nodes,
        priceId,
        scenic.price > 0 ? '收费景点' : '免费景点',
        'scenic',
        mode,
        comboId
      );
      addEdge(edges, edgeSet, scenicId, priceId);
    }
  });

  return {
    nodes,
    edges,
    combos: mode === 'independent' ? combos : undefined,
  };
}

/**
 * 添加节点（如果不存在）
 * @param mode 在独立模式下，由于ID唯一，无需判断重复
 * @param comboId 所属的 combo ID（仅在独立模式下使用）
 */
function addNodeIfNotExists(
  nodes: GraphNode[],
  id: string,
  label: string,
  type: string,
  mode: 'network' | 'independent' = 'network',
  comboId?: string
) {
  // 独立模式下，每个属性节点都是唯一的，直接添加
  if (mode === 'independent') {
    nodes.push({
      id,
      label,
      type,
      data: { id, label, type },
      comboId, // 在独立模式下分配 comboId
    });
  } else {
    // 网络模式下，需要去重
    if (!nodes.find((n) => n.id === id)) {
      nodes.push({
        id,
        label,
        type,
        data: { id, label, type },
      });
    }
  }
}

/**
 * 添加边（去重）
 */
function addEdge(
  edges: GraphEdge[],
  edgeSet: Set<string>,
  source: string,
  target: string
) {
  const edgeKey = `${source}-${target}`;
  if (!edgeSet.has(edgeKey)) {
    edges.push({ source, target });
    edgeSet.add(edgeKey);
  }
}

/**
 * 限制数据量，避免图太复杂
 * @param data 原始图数据
 * @param maxNodes 最大节点数
 * @returns 限制后的图数据
 */
export function limitGraphData(data: GraphData, maxNodes: number = 200): GraphData {
  if (data.nodes.length <= maxNodes) {
    return data;
  }

  // 只保留前 maxNodes 个节点
  const limitedNodes = data.nodes.slice(0, maxNodes);
  const nodeIds = new Set(limitedNodes.map((n) => n.id));

  // 只保留连接到保留节点的边
  const limitedEdges = data.edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
  );

  return {
    nodes: limitedNodes,
    edges: limitedEdges,
  };
}
