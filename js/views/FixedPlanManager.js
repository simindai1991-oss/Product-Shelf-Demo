import FixedPlanForm from '../components/FixedPlanForm.js';
import { formatMoney, formatRateDisplay } from '../utils.js';

export default {
    components: { FixedPlanForm },
    props: ['plans', 'items', 'systemDate', 'hasPermission'],
    emits: ['initiate-approval', 'mock-audit-pass', 'refresh-stats', 'delete-plan'],
    data() {
        return { 
            showModal: false, 
            modalMode: 'create', 
            editingPlan: {}, 
            selectedStatuses: ['草稿', '开放中', '已上架待开放', '已售罄'] 
        }
    },
    computed: {
        fixedSkus() { return this.items.filter(i => i.product_code === 'Fixed'); },
        allStatuses() { return ['草稿', '开放中', '已上架待开放', '已售罄', '已过期', '已下架']; },
        filteredPlans() {
            return this.plans.filter(p => {
                const status = this.getBusinessStatus(p);
                return this.selectedStatuses.includes(status);
            }).map(p => ({ 
                ...p, 
                displayStatus: this.getBusinessStatus(p),
                auditStatusLabel: this.getAuditStatusLabel(p),
                progress: p.total_issuance_amount > 0 ? Math.min(100, Math.floor((p.sold_amount / p.total_issuance_amount) * 100)) : 0 
            }));
        },
        stats() {
            const active = this.plans.filter(p => p.status === 'Active' || p.status === 'Approved');
            const total = active.reduce((s, p) => s + (p.total_issuance_amount || 0), 0);
            const sold = active.reduce((s, p) => s + (p.sold_amount || 0), 0);
            return { totalSize: total, totalSold: sold, sellRate: total > 0 ? ((sold / total) * 100).toFixed(1) : 0 };
        }
    },
    methods: {
        formatMoney,
        toggleStatus(s) {
            const idx = this.selectedStatuses.indexOf(s);
            if (idx > -1) this.selectedStatuses.splice(idx, 1);
            else this.selectedStatuses.push(s);
        },
        getPlanRate(plan) {
            if (plan.rates && plan.rates.length > 0) return (plan.rates[0].rate * 100).toFixed(2) + '%';
            return '-';
        },
        getBusinessStatus(p) {
            if (['Pending_Approval', 'Draft', 'Pending_Modification', 'Pending_OffShelf'].includes(p.status)) {
                if (p.status === 'Draft' || p.status === 'Pending_Approval') return '草稿';
                return '开放中'; 
            }
            if (p.status === 'Suspended' || p.status === 'Pending_OffShelf') return '已下架';
            const now = this.systemDate;
            if (p.sale_end_time && p.sale_end_time < now) return '已过期';
            if (p.sold_amount >= p.total_issuance_amount) return '已售罄';
            if (p.status === 'Active' || p.status === 'Pending_Modification') return '开放中';
            if (p.status === 'Approved') {
                 if (p.sale_start_time && p.sale_start_time <= now) return '开放中';
                 return '已上架待开放';
            }
            return p.status;
        },
        getAuditStatusLabel(p) {
            const map = { 'Pending_Approval': '上架审批中', 'Pending_Modification': '修改审批中', 'Pending_OffShelf': '下架审批中' };
            return map[p.status] || '';
        },
        getStatusColor(s) { 
            const map = { '开放中': 'text-opay', '已上架待开放': 'text-blue-600', '已售罄': 'text-red-500', '已过期': 'text-gray-400', '已下架': 'text-gray-400', '草稿': 'text-gray-500' };
            return map[s] || 'text-gray-600'; 
        },
        
        initCreate() {
            this.modalMode = 'create';
            this.editingPlan = { 
                plan_id: 'PLAN_' + Date.now(), item_code: 'Fixed_Special_Base', name: 'Fixed Special New', alias: 'New Promo',
                total_issuance_amount: 100000000, sold_amount: 0, min_sub_amount: 5000, max_single_sub: 1000000, cum_sub_limit: 5000000,
                period_days: 14, status: 'Draft', 
                sale_start_time: this.systemDate, sale_end_time: '2026-12-31',
                rates: [{ stepMinAmount: 0, rate: 0.15, displayRate: 15 }],
                benchmark_rate: 0.10
            };
            this.showModal = true;
        },
        openEdit(p) { 
            this.modalMode = 'edit'; 
            this.editingPlan = JSON.parse(JSON.stringify(p)); 
            if (!this.editingPlan.rates) this.editingPlan.rates = [];
            this.editingPlan.rates.forEach(r => r.displayRate = (r.rate * 100).toFixed(2));
            this.showModal = true; 
        },
        openView(p) {
            this.modalMode = 'view';
            this.editingPlan = JSON.parse(JSON.stringify(p));
            if (!this.editingPlan.rates) this.editingPlan.rates = [];
            this.editingPlan.rates.forEach(r => r.displayRate = (r.rate * 100).toFixed(2));
            this.showModal = true;
        },
        handleSave() {
            if (this.modalMode === 'view') { this.showModal = false; return; }
            if (!this.editingPlan.name) return alert('请输入单品名称');

            if (this.modalMode === 'create') {
                this.$emit('initiate-approval', this.editingPlan, 'save_draft'); 
            } else {
                const actionType = this.editingPlan.status === 'Draft' ? 'save_draft' : 'modify_fixed';
                this.$emit('initiate-approval', this.editingPlan, actionType);
            }
            this.showModal = false;
        },
        applyListing(plan) {
            const planCopy = JSON.parse(JSON.stringify(plan));
            this.$emit('initiate-approval', planCopy, 'apply_listing');
        },
        applyOffShelf(plan) {
            if (!confirm('确定要申请下架该单品吗？')) return;
            const planCopy = JSON.parse(JSON.stringify(plan));
            this.$emit('initiate-approval', planCopy, 'off_shelf');
        },
        handleDeletePlan(plan) {
            if (!confirm('确定要删除该草稿吗？此操作不可恢复。')) return;
            this.$emit('delete-plan', plan);
            this.showModal = false;
        },
        mockPass(plan) { this.$emit('mock-audit-pass', plan); },
        refreshStatsInternal() { this.$emit('refresh-stats'); }
    },
    template: `
        <div class="space-y-6">
            <div class="flex justify-between items-end">
                <div class="flex gap-2 items-center flex-wrap">
                    <span class="text-xs font-bold text-gray-500 mr-2">状态筛选:</span>
                    <button v-for="s in allStatuses" :key="s" @click="toggleStatus(s)"
                        :class="selectedStatuses.includes(s) ? 'bg-opay text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
                        class="px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1">
                        {{ s }} <span v-if="selectedStatuses.includes(s)">&times;</span>
                    </button>
                </div>
                <div class="flex gap-2">
                    <button @click="refreshStatsInternal" class="bg-white border hover:bg-gray-50 text-gray-600 px-3 py-2 rounded shadow-sm text-sm font-bold transition">
                        ↻ 刷新销量 (+5%)
                    </button>
                    <!-- 修改按钮文案为：单品发行 -->
                    <button v-if="hasPermission('FIXED_OPS:SPECIAL_PLAN:CREATE')" @click="initCreate" class="bg-opay hover:bg-opay-hover text-white px-4 py-2 rounded shadow font-bold flex items-center transition">
                        <span class="mr-1 text-lg">+</span> 单品发行
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase w-[25%]">单品信息</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase w-[15%]">销售周期</th> 
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase w-[15%]">利率</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase w-[25%]">销售进度</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase w-[20%]">状态 / 操作</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                        <tr v-for="plan in filteredPlans" :key="plan.plan_id" class="hover:bg-gray-50 transition">
                            <td class="px-6 py-3 cursor-pointer" @click="openEdit(plan)">
                                <div class="font-bold text-gray-900 text-sm truncate" :title="plan.name">{{ plan.name }}</div>
                                <div class="text-xs text-gray-500 mt-0.5 truncate" :title="plan.alias">{{ plan.alias }}</div>
                                <div class="text-[10px] text-gray-400 mt-1 font-mono">{{ plan.plan_id }}</div>
                            </td>
                            <td class="px-6 py-3">
                                <div class="flex flex-col text-xs font-mono text-gray-600 leading-tight">
                                    <span>{{ plan.sale_start_time }}</span>
                                    <span class="text-gray-400 text-[10px] transform scale-75 origin-left">至</span>
                                    <span>{{ plan.sale_end_time }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-3">
                                <span class="text-opay font-mono font-bold text-sm">{{ getPlanRate(plan) }}</span>
                            </td>
                            <td class="px-6 py-3">
                                <div class="flex items-center justify-between mb-1 text-xs">
                                    <span class="font-bold text-gray-700">{{ plan.progress }}%</span>
                                    <span class="text-gray-500 font-mono">{{ formatMoney(plan.sold_amount) }} / {{ formatMoney(plan.total_issuance_amount) }}</span>
                                </div>
                                <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div class="h-full rounded-full transition-all duration-500"
                                         :class="plan.displayStatus === '已售罄' ? 'bg-red-500' : (plan.displayStatus === '已上架待开放' ? 'bg-blue-400' : 'bg-opay')"
                                         :style="{ width: plan.progress + '%' }">
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-3 text-right">
                                <div class="flex flex-col items-end gap-1">
                                    <div class="text-sm font-bold" :class="getStatusColor(plan.displayStatus)">{{ plan.displayStatus }}</div>
                                    
                                    <div v-if="plan.auditStatusLabel" class="flex items-center gap-2 animate-pulse">
                                        <span class="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded border border-yellow-200">{{ plan.auditStatusLabel }}</span>
                                        <button @click="mockPass(plan)" class="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded hover:bg-blue-700 shadow-sm">通过</button>
                                    </div>

                                    <div v-else class="flex gap-2 justify-end">
                                        <button v-if="hasPermission('FIXED_OPS:SPECIAL_PLAN:EDIT') && !['已过期', '已下架'].includes(plan.displayStatus)" 
                                                @click="openEdit(plan)" class="text-gray-600 hover:text-opay text-xs font-bold">编辑</button>
                                        <button v-else @click="openView(plan)" class="text-gray-500 hover:text-gray-800 text-xs">查看</button>

                                        <button v-if="plan.displayStatus === '草稿' && hasPermission('FIXED_OPS:SPECIAL_PLAN:PUBLISH')" 
                                                @click="applyListing(plan)" 
                                                class="text-opay hover:text-green-800 text-xs font-bold border border-green-200 px-2 py-0.5 rounded bg-green-50">上架</button>
                                        
                                        <button v-if="plan.displayStatus === '草稿' && hasPermission('FIXED_OPS:SPECIAL_PLAN:EDIT')" 
                                                @click="handleDeletePlan(plan)" 
                                                class="text-gray-400 hover:text-red-600 text-xs font-bold border border-gray-200 hover:border-red-200 px-2 py-0.5 rounded bg-gray-50 hover:bg-red-50">删除</button>

                                        <button v-if="['开放中', '已上架待开放', '已售罄'].includes(plan.displayStatus) && hasPermission('FIXED_OPS:SPECIAL_PLAN:OFFSHELF')" 
                                                @click="applyOffShelf(plan)" 
                                                class="text-red-600 hover:text-red-800 text-xs font-bold border border-red-200 px-2 py-0.5 rounded bg-red-50">下架</button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <FixedPlanForm v-if="showModal" v-model="editingPlan" :mode="modalMode" :fixed-items="fixedSkus" @close="showModal = false" @save="handleSave" @delete="handleDeletePlan" />
        </div>
    `
};