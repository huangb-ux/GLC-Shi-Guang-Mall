import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  // 用相对路径，GitHub Pages 的项目路径和本地 dist 都能直接打开。
  base: './',
  plugins: [vue()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    watch: {
      // 编辑器保存时可能产生临时目录，Windows 下会被 Vite 的文件监听锁住。
      ignored: ['**/node_modules/**', '**/.git/**', '**/*.tmpdir/**']
    }
  }
});
