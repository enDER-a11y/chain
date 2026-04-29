import { createRouter, createWebHistory } from 'vue-router'
import EnterpriseLayout from '../pages/enterprise/layout/EnterpriseLayout.vue'
import EnterpriseDashboard from '../pages/enterprise/Dashboard.vue'
import EnterpriseOverview from '../pages/enterprise/DataOverview.vue'
import EnterpriseAlerts from '../pages/enterprise/Alerts.vue'
import EnterpriseReport from '../pages/enterprise/DataReport.vue'
import EnterpriseUpstreamDownstream from '../pages/enterprise/UpstreamDownstream.vue'
import EnterpriseBatchManagement from '../pages/enterprise/BatchManagement.vue'
// 注意：这里必须和你本地文件名完全一致，包括大小写
import ConsumerHome from '../pages/consumer/Home.vue'
import UpstreamDetail from '../pages/consumer/UpstreamDetail.vue'
import MidstreamDetail from '../pages/consumer/MidStreamDetail.vue'
import DownstreamDetail from '../pages/consumer/DownStreamDetail.vue'
import QrTrace from '../pages/consumer/QrTrace.vue'

const routes = [
    { path: '/', redirect: '/consumer' },
    {
        path: '/enterprise',
        component: EnterpriseLayout,
        redirect: '/enterprise/dashboard',
        children: [
            { path: 'dashboard', name: 'EnterpriseDashboard', component: EnterpriseDashboard },
            { path: 'overview', name: 'EnterpriseOverview', component: EnterpriseOverview },
            { path: 'alerts', name: 'EnterpriseAlerts', component: EnterpriseAlerts },
            { path: 'report', name: 'EnterpriseReport', component: EnterpriseReport },
            { path: 'upstream-downstream', name: 'EnterpriseUpstreamDownstream', component: EnterpriseUpstreamDownstream },
            { path: 'batch', name: 'EnterpriseBatchManagement', component: EnterpriseBatchManagement },
            { path: 'emergency-response', name: 'EmergencyResponse', component: () => import('@/pages/enterprise/EmergencyResponse.vue') }
        ]
    },
    { path: '/consumer', name: 'ConsumerHome', component: ConsumerHome },
    { path: '/consumer/upstream', name: 'UpstreamDetail', component: UpstreamDetail },
    { path: '/consumer/midstream', name: 'MidstreamDetail', component: MidstreamDetail },
    { path: '/consumer/downstream', name: 'DownstreamDetail', component: DownstreamDetail },
    { path: '/consumer/trace', name: 'QrTrace', component: QrTrace }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router