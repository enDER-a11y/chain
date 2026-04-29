import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
    server: {
        port: 3000,
        host: true, // 允许局域网设备访问（手机扫码打开）
        open: true
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    plugins: [vue()] // 仅保留 Vue 核心插件
})