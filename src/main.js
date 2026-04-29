import { createApp } from 'vue'
import ElementPlus from 'element-plus'  // 直接导入整个 ElementPlus
import 'element-plus/dist/index.css'

// Vant 组件 - 只保留确实存在的组件
import { Button, Card, List, Collapse, Image, Cell, CellGroup } from 'vant'
import 'vant/lib/index.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 注册Element Plus（直接使用整个插件）
app.use(ElementPlus)

// 注册Vant组件（按需注册）
app.use(Button)
app.use(Card)
app.use(List)
app.use(Collapse)
app.use(Image)
app.use(Cell)
app.use(CellGroup)

// 注册路由
app.use(router)

app.mount('#app')