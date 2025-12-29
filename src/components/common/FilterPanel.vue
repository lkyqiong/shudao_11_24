<template>
  <div class="filter-panel">
    <div class="filter-header" @click="toggleExpand">
      <span>高级筛选</span>
      <span class="toggle-icon">{{ isExpanded ? '▼' : '▶' }}</span>
    </div>

    <div v-if="isExpanded" class="filter-content">
      <!-- 数据类型筛选 -->
      <div class="filter-section">
        <div class="section-title">数据类型</div>
        <div class="checkbox-group">
          <label>
            <input type="checkbox" v-model="filters.types" value="poem" />
            <span>诗词</span>
          </label>
          <label>
            <input type="checkbox" v-model="filters.types" value="heritage" />
            <span>非遗</span>
          </label>
          <label>
            <input type="checkbox" v-model="filters.types" value="history" />
            <span>历史</span>
          </label>
          <label>
            <input type="checkbox" v-model="filters.types" value="scenic" />
            <span>景点</span>
          </label>
        </div>
      </div>

      <!-- 名称筛选 -->
      <div class="filter-section">
        <div class="section-title">名称</div>
        <div class="input-wrapper">
          <input
            v-model="filters.name"
            type="text"
            class="filter-input"
            placeholder="输入名称筛选..."
          />
        </div>
      </div>

      <!-- 地点筛选 -->
      <div class="filter-section">
        <div class="section-title">地点</div>
        <div class="input-wrapper">
          <input
            v-model="filters.province"
            type="text"
            class="filter-input"
            placeholder="输入省份筛选..."
            list="province-list"
          />
          <datalist id="province-list">
            <option v-for="province in filteredProvinces" :key="province" :value="province" />
          </datalist>
        </div>
        <div class="input-wrapper">
          <input
            v-model="filters.city"
            type="text"
            class="filter-input"
            placeholder="输入城市筛选..."
            list="city-list"
          />
          <datalist id="city-list">
            <option v-for="city in filteredCities" :key="city" :value="city" />
          </datalist>
        </div>
        <div class="input-wrapper">
          <input
            v-model="filters.county"
            type="text"
            class="filter-input"
            placeholder="输入县区筛选..."
            list="county-list"
          />
          <datalist id="county-list">
            <option v-for="county in filteredCounties" :key="county" :value="county" />
          </datalist>
        </div>
        <div class="input-wrapper">
          <input
            v-model="filters.place"
            type="text"
            class="filter-input"
            placeholder="输入景点地点筛选..."
            list="place-list"
          />
          <datalist id="place-list">
            <option v-for="place in filteredPlaces" :key="place" :value="place" />
          </datalist>
        </div>
      </div>

      <!-- 人物筛选 -->
      <div class="filter-section">
        <div class="section-title">人物</div>
        <div class="input-wrapper">
          <input
            v-model="filters.author"
            type="text"
            class="filter-input"
            placeholder="输入作者筛选..."
            list="author-list"
          />
          <datalist id="author-list">
            <option v-for="author in filteredAuthors" :key="author" :value="author" />
          </datalist>
        </div>
        <div class="input-wrapper">
          <input
            v-model="filters.people"
            type="text"
            class="filter-input"
            placeholder="输入历史人物筛选..."
            list="people-list"
          />
          <datalist id="people-list">
            <option v-for="person in filteredPeople" :key="person" :value="person" />
          </datalist>
        </div>
      </div>

      <!-- 时间筛选 -->
      <div class="filter-section">
        <div class="section-title">时间</div>
        <div class="input-wrapper">
          <input
            v-model="filters.dynasty"
            type="text"
            class="filter-input"
            placeholder="输入朝代筛选..."
            list="dynasty-list"
          />
          <datalist id="dynasty-list">
            <option v-for="dynasty in filteredDynasties" :key="dynasty" :value="dynasty" />
          </datalist>
        </div>
        <div class="input-wrapper">
          <input
            v-model="filters.period"
            type="text"
            class="filter-input"
            placeholder="输入时期筛选..."
            list="period-list"
          />
          <datalist id="period-list">
            <option v-for="period in filteredPeriods" :key="period" :value="period" />
          </datalist>
        </div>
        <div class="input-wrapper">
          <input
            v-model="filters.rxTime"
            type="text"
            class="filter-input"
            placeholder="输入非遗入选批次筛选..."
            list="rxtime-list"
          />
          <datalist id="rxtime-list">
            <option v-for="rxtime in filteredRxTimes" :key="rxtime" :value="rxtime" />
          </datalist>
        </div>
      </div>

      <!-- 补充筛选 -->
      <div class="filter-section">
        <div class="section-title">补充</div>
        <div class="input-wrapper">
          <input
            v-model="filters.poemType"
            type="text"
            class="filter-input"
            placeholder="输入诗歌类型筛选..."
            list="poemtype-list"
          />
          <datalist id="poemtype-list">
            <option v-for="type in filteredPoemTypes" :key="type" :value="type" />
          </datalist>
        </div>
        <div class="input-wrapper">
          <input
            v-model="filters.heritageType"
            type="text"
            class="filter-input"
            placeholder="输入非遗类型筛选..."
            list="heritage-type-list"
          />
          <datalist id="heritage-type-list">
            <option v-for="type in filteredHeritageTypes" :key="type" :value="type" />
          </datalist>
        </div>
        <div class="input-wrapper">
          <input
            v-model="filters.property"
            type="text"
            class="filter-input"
            placeholder="输入历史属性筛选..."
            list="property-list"
          />
          <datalist id="property-list">
            <option v-for="prop in filteredProperties" :key="prop" :value="prop" />
          </datalist>
        </div>
        <div class="input-wrapper">
          <input
            v-model="filters.sightLevel"
            type="text"
            class="filter-input"
            placeholder="输入景区等级筛选..."
            list="sight-level-list"
          />
          <datalist id="sight-level-list">
            <option v-for="level in filteredSightLevels" :key="level" :value="level" />
          </datalist>
        </div>
        <div class="input-wrapper">
          <input
            v-model="filters.score"
            type="text"
            class="filter-input"
            placeholder="输入景区评分筛选..."
          />
        </div>
        <div class="input-wrapper">
          <input
            v-model="filters.price"
            type="text"
            class="filter-input"
            placeholder="输入景区价格筛选..."
          />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="filter-actions">
        <button class="btn-apply" @click="applyFilters">应用筛选</button>
        <button class="btn-reset" @click="resetFilters">重置</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import type { FilterOptions } from '@/services/api';
  import { fetchFilterOptions } from '@/services/api';

  // 筛选选项数据
  const options = ref<FilterOptions>({
    dynasties: [],
    authors: [],
    poemtypes: [],
    keywords: [],
    rx_times: [],
    heritage_types: [],
    people: [],
    periods: [],
    properties: [],
    sight_levels: [],
    provinces: [],
    cities: [],
    counties: [],
    places: [],
    score_range: { min: 0, max: 5 },
  });

  // 筛选条件
  const filters = ref({
    types: ['poem', 'heritage', 'history', 'scenic'], // 默认全选
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

  // 面板展开状态
  const isExpanded = ref(false);

  // 自动补全的计算属性 - 根据输入值筛选选项
  const filteredProvinces = computed(() => {
    if (!filters.value.province) return options.value.provinces;
    return options.value.provinces.filter(p =>
      p.toLowerCase().includes(filters.value.province.toLowerCase())
    );
  });

  const filteredCities = computed(() => {
    if (!filters.value.city) return options.value.cities;
    return options.value.cities.filter(c =>
      c.toLowerCase().includes(filters.value.city.toLowerCase())
    );
  });

  const filteredCounties = computed(() => {
    if (!filters.value.county) return options.value.counties;
    return options.value.counties.filter(c =>
      c.toLowerCase().includes(filters.value.county.toLowerCase())
    );
  });

  const filteredPlaces = computed(() => {
    if (!filters.value.place) return options.value.places;
    return options.value.places.filter(p =>
      p.toLowerCase().includes(filters.value.place.toLowerCase())
    );
  });

  const filteredAuthors = computed(() => {
    if (!filters.value.author) return options.value.authors;
    return options.value.authors.filter(a =>
      a.toLowerCase().includes(filters.value.author.toLowerCase())
    );
  });

  const filteredPeople = computed(() => {
    if (!filters.value.people) return options.value.people;
    return options.value.people.filter(p =>
      p.toLowerCase().includes(filters.value.people.toLowerCase())
    );
  });

  const filteredDynasties = computed(() => {
    if (!filters.value.dynasty) return options.value.dynasties;
    return options.value.dynasties.filter(d =>
      d.toLowerCase().includes(filters.value.dynasty.toLowerCase())
    );
  });

  const filteredPeriods = computed(() => {
    if (!filters.value.period) return options.value.periods;
    return options.value.periods.filter(p =>
      p.toLowerCase().includes(filters.value.period.toLowerCase())
    );
  });

  const filteredRxTimes = computed(() => {
    if (!filters.value.rxTime) return options.value.rx_times;
    return options.value.rx_times.filter(r =>
      String(r).toLowerCase().includes(filters.value.rxTime.toLowerCase())
    );
  });

  const filteredPoemTypes = computed(() => {
    if (!filters.value.poemType) return options.value.poemtypes;
    return options.value.poemtypes.filter(t =>
      t.toLowerCase().includes(filters.value.poemType.toLowerCase())
    );
  });

  const filteredHeritageTypes = computed(() => {
    if (!filters.value.heritageType) return options.value.heritage_types;
    return options.value.heritage_types.filter(t =>
      t.toLowerCase().includes(filters.value.heritageType.toLowerCase())
    );
  });

  const filteredProperties = computed(() => {
    if (!filters.value.property) return options.value.properties;
    return options.value.properties.filter(p =>
      p.toLowerCase().includes(filters.value.property.toLowerCase())
    );
  });

  const filteredSightLevels = computed(() => {
    if (!filters.value.sightLevel) return options.value.sight_levels;
    return options.value.sight_levels.filter(l =>
      l.toLowerCase().includes(filters.value.sightLevel.toLowerCase())
    );
  });

  // 定义 emit
  const emit = defineEmits<{
    filterChange: [filters: typeof filters.value];
  }>();

  // 切换展开/收起
  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
  };

  // 应用筛选
  const applyFilters = () => {
    emit('filterChange', filters.value);
  };

  // 重置筛选
  const resetFilters = () => {
    filters.value = {
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
    };
    emit('filterChange', filters.value);
  };

  // 加载筛选选项
  const loadFilterOptions = async () => {
    const data = await fetchFilterOptions();
    if (data) {
      options.value = data;
    }
  };

  onMounted(() => {
    loadFilterOptions();
  });
</script>

<style scoped>
  .filter-panel {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .filter-header {
    padding: 10px 14px;
    background: #5a9090;
    color: white;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    font-size: 12px;
    user-select: none;
  }

  .filter-header:hover {
    background: #4a7a7a;
  }

  .toggle-icon {
    font-size: 10px;
  }

  .filter-content {
    padding: 16px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .filter-section {
    margin-bottom: 12px;
  }

  .section-title {
    font-weight: bold;
    color: #333;
    margin-bottom: 6px;
    font-size: 11px;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .checkbox-group label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    font-size: 11px;
  }

  .checkbox-group input[type="checkbox"] {
    cursor: pointer;
  }

  .input-wrapper {
    margin-bottom: 6px;
  }

  .filter-input {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 11px;
    outline: none;
    transition: border-color 0.3s;
  }

  .filter-input:focus {
    border-color: #5a9090;
  }

  .filter-input::placeholder {
    color: #999;
    font-size: 11px;
  }

  .filter-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #eee;
  }

  .btn-apply,
  .btn-reset {
    flex: 1;
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    transition: all 0.3s;
  }

  .btn-apply {
    background: #5a9090;
    color: white;
  }

  .btn-apply:hover {
    background: #4a7a7a;
  }

  .btn-reset {
    background: #f0f0f0;
    color: #666;
  }

  .btn-reset:hover {
    background: #e0e0e0;
  }
</style>
