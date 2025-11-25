// src/shims-vue.d.ts,这一步让 TS 知道 .vue 文件是 Vue 组件，可以导入。
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
