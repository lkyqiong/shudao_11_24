/**
 * 蜀道路线数据服务
 * 对接后端 API，数据存储在数据库中
 */

// API 基础地址
const API_BASE = 'http://localhost:8000';

export interface RoutePoint {
  longitude: number;
  latitude: number;
  name?: string;
  elevation?: number;
  description?: string;
}

export interface ShuDaoRoute {
  id: string;
  name: string;
  description: string;
  color: string;
  points: RoutePoint[];
  totalDistance?: number;
  difficulty?: '简单' | '中等' | '困难';
  historicalPeriod?: string;
  highlights?: string[];
}

export interface CustomRoute {
  id: number;  // 数据库中是 integer
  name: string;
  description?: string;
  color: string;
  points: RoutePoint[];
  distance?: number;
  create_time?: string;
}

export interface RouteSummary {
  id: number;
  name: string;
  distance: number;
  points_count: number;
  create_time?: string;
}

// ==================== 预设蜀道路线（本地数据）====================

export const SHUDAO_ROUTES: ShuDaoRoute[] = [
  {
    id: 'qingming',
    name: '清明古蜀道',
    description: '清明古蜀道是蜀道中保存最为完好的一段，沿途古迹众多，风景秀丽。',
    color: '#10b981',
    difficulty: '中等',
    historicalPeriod: '秦汉至明清',
    highlights: ['翠云廊', '剑门关', '古柏森森'],
    points: [
      { longitude: 105.5231, latitude: 32.1864, name: '剑阁县城', elevation: 680 },
      { longitude: 105.5689, latitude: 32.2547, name: '翠云廊北段', elevation: 720 },
      { longitude: 105.6234, latitude: 32.3156, name: '大柏树湾', elevation: 750 },
      { longitude: 105.6891, latitude: 32.3842, name: '剑门关', elevation: 820 },
      { longitude: 105.7456, latitude: 32.4231, name: '昭化古城', elevation: 520 },
    ],
  },
  {
    id: 'jinniu',
    name: '金牛道',
    description: '金牛道是古代连接陕西与四川的重要通道，因秦惠王以金牛诱蜀而得名。',
    color: '#f59e0b',
    difficulty: '中等',
    historicalPeriod: '战国至清代',
    highlights: ['剑门关', '昭化古城', '翠云廊', '明月峡'],
    points: [
      { longitude: 106.9167, latitude: 34.2583, name: '汉中', elevation: 500 },
      { longitude: 106.6833, latitude: 33.9167, name: '宁强', elevation: 800 },
      { longitude: 106.3521, latitude: 33.4892, name: '朝天区', elevation: 650 },
      { longitude: 106.1986, latitude: 32.9419, name: '广元', elevation: 450 },
      { longitude: 105.8297, latitude: 32.4353, name: '剑阁', elevation: 600 },
      { longitude: 105.4631, latitude: 31.7781, name: '梓潼', elevation: 420 },
      { longitude: 104.6797, latitude: 31.4675, name: '绵阳', elevation: 470 },
      { longitude: 104.0657, latitude: 30.6595, name: '成都', elevation: 500 },
    ],
  },
  {
    id: 'micang',
    name: '米仓道',
    description: '米仓道因翻越米仓山而得名，是连接汉中与巴中的重要古道。',
    color: '#06b6d4',
    difficulty: '困难',
    historicalPeriod: '秦汉至明清',
    highlights: ['光雾山', '诺水河', '南江大峡谷'],
    points: [
      { longitude: 107.0292, latitude: 33.0672, name: '汉中南郑', elevation: 550 },
      { longitude: 106.9123, latitude: 32.8456, name: '碑坝镇', elevation: 1200 },
      { longitude: 106.8500, latitude: 32.7500, name: '米仓山垭口', elevation: 2200 },
      { longitude: 106.8333, latitude: 32.3500, name: '南江县', elevation: 800 },
      { longitude: 106.7667, latitude: 31.8583, name: '巴中', elevation: 400 },
    ],
  },
  {
    id: 'boxie',
    name: '褒斜道',
    description: '褒斜道是最早开通的蜀道，因经过褒谷和斜谷而得名。',
    color: '#8b5cf6',
    difficulty: '困难',
    historicalPeriod: '周代至唐代',
    highlights: ['石门栈道', '褒河', '衮雪石刻'],
    points: [
      { longitude: 107.3617, latitude: 34.3628, name: '眉县斜谷口', elevation: 600 },
      { longitude: 107.2145, latitude: 34.1892, name: '太白县城', elevation: 1500 },
      { longitude: 107.1000, latitude: 34.0000, name: '太白山区', elevation: 1800 },
      { longitude: 106.9500, latitude: 33.6500, name: '留坝县', elevation: 1200 },
      { longitude: 106.9167, latitude: 33.0667, name: '汉中褒谷口', elevation: 500 },
    ],
  },
  {
    id: 'yinping',
    name: '阴平道',
    description: '阴平道因经过阴平郡而得名。三国时邓艾偷渡阴平灭蜀。',
    color: '#ec4899',
    difficulty: '困难',
    historicalPeriod: '三国至明清',
    highlights: ['阴平古道', '摩天岭', '江油关'],
    points: [
      { longitude: 104.9167, latitude: 33.3917, name: '文县', elevation: 950 },
      { longitude: 104.8234, latitude: 33.2156, name: '摩天岭', elevation: 2800 },
      { longitude: 104.7500, latitude: 33.0500, name: '青川', elevation: 850 },
      { longitude: 104.7000, latitude: 32.7500, name: '平武', elevation: 900 },
      { longitude: 104.7456, latitude: 31.7781, name: '江油', elevation: 500 },
    ],
  },
  {
    id: 'lizhi',
    name: '荔枝道',
    description: '荔枝道因唐玄宗为杨贵妃运送荔枝而闻名。',
    color: '#ef4444',
    difficulty: '中等',
    historicalPeriod: '唐代',
    highlights: ['涪陵荔枝园', '万源', '达州'],
    points: [
      { longitude: 107.3947, latitude: 29.7028, name: '涪陵', elevation: 200 },
      { longitude: 107.5000, latitude: 30.5000, name: '垫江', elevation: 400 },
      { longitude: 107.5019, latitude: 31.2097, name: '达州', elevation: 300 },
      { longitude: 108.0333, latitude: 32.0667, name: '万源', elevation: 600 },
      { longitude: 107.0167, latitude: 33.0667, name: '西乡', elevation: 450 },
    ],
  },
];

// ==================== 预设路线函数 ====================

export function getAllShuDaoRoutes(): ShuDaoRoute[] {
  return SHUDAO_ROUTES;
}

export function getShuDaoRouteById(id: string): ShuDaoRoute | undefined {
  return SHUDAO_ROUTES.find((route) => route.id === id);
}

// ==================== 距离计算 ====================

export function calculateDistance(point1: RoutePoint, point2: RoutePoint): number {
  const R = 6371;
  const dLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const dLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.latitude * Math.PI) / 180) *
      Math.cos((point2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateTotalDistance(points: RoutePoint[]): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (p1 && p2) {
      total += calculateDistance(p1, p2);
    }
  }
  return Math.round(total * 10) / 10;
}

// ==================== 自定义路线 API 调用 ====================

/**
 * 获取所有自定义路线（可选用户名筛选）
 */
export async function getCustomRoutes(username?: string): Promise<CustomRoute[]> {
  try {
    const url = username
      ? `${API_BASE}/api/routes?username=${encodeURIComponent(username)}`
      : `${API_BASE}/api/routes`;
    const response = await fetch(url);
    const result = await response.json();

    if (result.success) {
      // 为每条路线生成随机颜色
      return result.data.map((route: any) => ({
        ...route,
        color: generateRandomColor(),
      }));
    }
    return [];
  } catch (error) {
    console.error('获取路线失败:', error);
    return [];
  }
}

/**
 * 获取路线摘要（用于用户页面）
 */
export async function getRoutesSummary(username?: string): Promise<RouteSummary[]> {
  try {
    const url = username
      ? `${API_BASE}/api/routes/summary?username=${encodeURIComponent(username)}`
      : `${API_BASE}/api/routes/summary`;
    const response = await fetch(url);
    const result = await response.json();

    if (result.success) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error('获取路线摘要失败:', error);
    return [];
  }
}

/**
 * 保存自定义路线
 */
export async function saveCustomRoute(route: {
  name: string;
  description?: string;
  points: RoutePoint[];
}, username?: string): Promise<CustomRoute | null> {
  try {
    const url = username
      ? `${API_BASE}/api/routes?username=${encodeURIComponent(username)}`
      : `${API_BASE}/api/routes`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(route),
    });
    const result = await response.json();

    if (result.success) {
      return {
        ...result.data,
        color: generateRandomColor(),
      };
    }
    console.error('保存路线失败:', result.error);
    return null;
  } catch (error) {
    console.error('保存路线失败:', error);
    return null;
  }
}

/**
 * 更新自定义路线
 */
export async function updateCustomRoute(
  id: number,
  route: {
    name?: string;
    description?: string;
    points?: RoutePoint[];
  }
): Promise<CustomRoute | null> {
  try {
    const response = await fetch(`${API_BASE}/api/routes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(route),
    });
    const result = await response.json();
    
    if (result.success) {
      return {
        ...result.data,
        color: generateRandomColor(),
      };
    }
    return null;
  } catch (error) {
    console.error('更新路线失败:', error);
    return null;
  }
}

/**
 * 删除自定义路线
 */
export async function deleteCustomRoute(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/routes/${id}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('删除路线失败:', error);
    return false;
  }
}

// ==================== 工具函数 ====================

export function generateRouteId(): string {
  return `route_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function generateRandomColor(): string {
  const colors: string[] = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  ];
  const index = Math.floor(Math.random() * colors.length);
  return colors[index] ?? '#3b82f6';
}

// ==================== 海拔数据 ====================

export async function fetchElevationForPoints(points: RoutePoint[]): Promise<number[]> {
  if (points.length === 0) return [];

  const locations = points.map(p => ({ latitude: p.latitude, longitude: p.longitude }));

  try {
    const response = await fetch('https://api.open-elevation.com/api/v1/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locations }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.results && Array.isArray(data.results)) {
        return data.results.map((r: { elevation: number }) => Math.round(r.elevation));
      }
    }
    return estimateElevation(points);
  } catch (error) {
    console.warn('Elevation API failed, using estimates', error);
    return estimateElevation(points);
  }
}

function estimateElevation(points: RoutePoint[]): number[] {
  return points.map(p => {
    const lat = p.latitude;
    const lon = p.longitude;
    let baseElevation = 500;
    if (lat > 33) baseElevation = 800 + (lat - 33) * 300;
    if (lon < 104) baseElevation += (104 - lon) * 200;
    const variation = Math.sin(lon * 10) * 100 + Math.cos(lat * 10) * 100;
    return Math.round(Math.max(200, baseElevation + variation));
  });
}

// ==================== KML 导入导出 ====================

export async function parseKMLFile(file: File): Promise<RoutePoint[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, 'text/xml');
        const points: RoutePoint[] = [];
        const coordinatesElements = xmlDoc.getElementsByTagName('coordinates');
        
        for (let i = 0; i < coordinatesElements.length; i++) {
          const element = coordinatesElements[i];
          if (element && element.textContent) {
            const coordText = element.textContent.trim();
            if (coordText) {
              const coordPairs = coordText.split(/\s+/);
              coordPairs.forEach((pair, idx) => {
                const parts = pair.split(',');
                if (parts.length >= 2) {
                  const lon = Number(parts[0]);
                  const lat = Number(parts[1]);
                  if (!isNaN(lon) && !isNaN(lat)) {
                    const point: RoutePoint = {
                      longitude: lon,
                      latitude: lat,
                      name: `点位${idx + 1}`,
                    };
                    if (parts.length >= 3) {
                      const alt = Number(parts[2]);
                      if (!isNaN(alt)) point.elevation = alt;
                    }
                    points.push(point);
                  }
                }
              });
            }
          }
        }
        resolve(points);
      } catch (error) {
        reject(new Error('KML文件解析失败'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}

export function exportRouteToKML(route: ShuDaoRoute | CustomRoute): string {
  const coordinates = route.points
    .map((p) => {
      const elev = p.elevation !== undefined ? p.elevation : 0;
      return `${p.longitude},${p.latitude},${elev}`;
    })
    .join('\n          ');

  const desc = route.description !== undefined ? route.description : '';
  const colorHex = route.color.slice(1);
  const kmlColor = `ff${colorHex.slice(4, 6)}${colorHex.slice(2, 4)}${colorHex.slice(0, 2)}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${route.name}</name>
    <description>${desc}</description>
    <Style id="routeStyle">
      <LineStyle>
        <color>${kmlColor}</color>
        <width>4</width>
      </LineStyle>
    </Style>
    <Placemark>
      <name>${route.name}</name>
      <styleUrl>#routeStyle</styleUrl>
      <LineString>
        <coordinates>
          ${coordinates}
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;
}