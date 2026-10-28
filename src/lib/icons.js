import './art.js';

// art.js 原本是给静态页面用的，会把插画和图标挂到 window 上。
// 这里做一层轻量封装，让 Vue 组件可以按模块的方式引入。
export const Art = window.Art;
export const icon = window.icon;
export const iconFilled = window.iconFilled;
export const categoryIcon = window.categoryIcon;
