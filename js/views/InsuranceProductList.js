import InsurancePlanForm from '../components/InsurancePlanForm.js';
import { formatMoney } from '../utils.js';

export default {
    components: { InsurancePlanForm },
    props: ['plans', 'categories', 'companies', 'hasPermission'],
    emits: ['create-plan', 'update-plan', 'reorder-plans'],
    data() {
        return {
            showModal: false,
            modalMode: 'view',
            editingPlan: {},
            sortMode: false,
            draftOrder: [],
            filters: { keyword: '', insuranceType: '', underwriterCode: '' }
        };
    },
    computed: {
        sortedPlans() {
            const list = (this.sortMode ? this.draftOrder : this.plans) || [];
            return [...list].sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
        },
        filteredPlans() {
            const kw = (this.filters.keyword || '').toLowerCase();
            return this.sortedPlans.filter(p => {
                if (this.filters.insuranceType && p.insuranceType !== this.filters.insuranceType) return false;
                if (this.filters.underwriterCode && p.underwriterCode !== this.filters.underwriterCode) return false;
                if (kw) {
                    const hay = `${p.planCode} ${p.planName} ${p.externalProductCode || ''}`.toLowerCase();
                    if (!hay.includes(kw)) return false;
                }
                return true;
            });
        },
        canEdit() { return this.hasPermission('INSURANCE_MGMT:PLAN:EDIT'); },
        canCreate() { return this.hasPermission('INSURANCE_MGMT:PLAN:CREATE'); }
    },
    methods: {
        formatMoney,
        companyName(code) {
            const c = (this.companies || []).find(x => x.code === code);
            return c ? c.shortName || c.name : code;
        },
        categoryName(code) {
            const c = (this.categories || []).find(x => x.code === code);
            return c ? c.name : code;
        },
        emptyPlan() {
            const nextOrder = this.plans.length
                ? Math.max(...this.plans.map(p => p.sortOrder || 0)) + 1
                : 1;
            return {
                planCode: '',
                underwriterCode: '',
                planName: '',
                externalProductCode: '',
                insuranceType: (this.categories[0] && this.categories[0].code) || 'HMO',
                providerNetworkSummary: '',
                gracePeriodEnabled: true,
                gracePeriodDays: 7,
                autoRenewLeadDays: 0,
                supportedPaymentModes: ['MONTHLY'],
                monthlyPrice: 0,
                quarterlyPrice: 0,
                biannualPrice: 0,
                annualPrice: 0,
                shelfStatus: 'Draft',
                isActive: false,
                firstMonthFree: false,
                promoLabel: '',
                minInsuredAge: null,
                maxInsuredAge: null,
                sortOrder: nextOrder,
                shortDescription: '',
                brochureName: '',
                brochureUrl: '',
                claimGuideUrl: '',
                telemedicineUrl: '',
                coverImageUrl: '',
                faqs: [],
                claimSteps: [],
                covers: []
            };
        },
        shelfStatusText(p) {
            const s = p.shelfStatus || (p.isActive ? 'OnShelf' : 'OffShelf');
            return { Draft: '草稿', OnShelf: '上架', OffShelf: '下架' }[s] || s;
        },
        shelfStatusClass(p) {
            const s = p.shelfStatus || (p.isActive ? 'OnShelf' : 'OffShelf');
            return {
                Draft: 'bg-gray-100 text-gray-600 border-gray-200',
                OnShelf: 'bg-green-50 text-green-700 border-green-200',
                OffShelf: 'bg-amber-50 text-amber-700 border-amber-200'
            }[s] || 'bg-gray-100 text-gray-500 border-gray-200';
        },
        openCreate() {
            this.modalMode = 'create';
            this.editingPlan = this.emptyPlan();
            this.showModal = true;
        },
        openView(p) {
            this.modalMode = 'view';
            this.editingPlan = JSON.parse(JSON.stringify(p));
            this.showModal = true;
        },
        openEdit(p) {
            this.modalMode = 'edit';
            this.editingPlan = JSON.parse(JSON.stringify(p));
            this.showModal = true;
        },
        handleSave(plan) {
            if (this.modalMode === 'create') this.$emit('create-plan', plan);
            else this.$emit('update-plan', plan);
            this.showModal = false;
        },
        enterSortMode() {
            this.filters = { keyword: '', insuranceType: '', underwriterCode: '' };
            this.draftOrder = JSON.parse(JSON.stringify(this.plans));
            this.sortMode = true;
        },
        cancelSort() {
            this.sortMode = false;
            this.draftOrder = [];
        },
        movePlan(planCode, dir) {
            const list = [...this.draftOrder].sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
            const i = list.findIndex(p => p.planCode === planCode);
            const j = i + dir;
            if (i < 0 || j < 0 || j >= list.length) return;
            const tmp = list[i];
            list[i] = list[j];
            list[j] = tmp;
            list.forEach((p, idx) => { p.sortOrder = idx + 1; });
            this.draftOrder = list;
        },
        saveSort() {
            const ordered = [...this.draftOrder]
                .sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99))
                .map((p, idx) => ({ planCode: p.planCode, sortOrder: idx + 1 }));
            this.$emit('reorder-plans', ordered);
            this.sortMode = false;
            this.draftOrder = [];
        }
    },
    template: `
        <div class="space-y-6">
            <div class="flex justify-between items-start gap-4">
                <div>
                    <h2 class="text-xl font-bold text-gray-800">保险产品列表</h2>
                </div>
                <div class="flex gap-2 shrink-0">
                    <template v-if="!sortMode">
                        <button v-if="canEdit" @click="enterSortMode" class="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded text-xs font-bold transition">配置排序</button>
                        <button v-if="canCreate" @click="openCreate" class="bg-opay hover:bg-opay-hover text-white px-4 py-2 rounded shadow text-sm font-bold transition">+ 新建产品</button>
                    </template>
                    <template v-else>
                        <button @click="cancelSort" class="border border-gray-300 bg-white text-gray-600 px-3 py-2 rounded text-xs font-bold">取消</button>
                        <button @click="saveSort" class="bg-opay hover:bg-opay-hover text-white px-4 py-2 rounded text-xs font-bold shadow">保存排序</button>
                    </template>
                </div>
            </div>

            <div v-if="!sortMode" class="flex flex-wrap gap-3 items-center">
                <input v-model="filters.keyword" placeholder="搜索 planCode / 名称..." class="border border-gray-300 rounded px-3 py-2 text-sm w-64 outline-none focus:ring-1 focus:ring-opay">
                <select v-model="filters.insuranceType" class="border border-gray-300 rounded px-3 py-2 text-sm bg-white outline-none">
                    <option value="">全部品类</option>
                    <option v-for="c in categories" :key="c.code" :value="c.code">{{ c.name }}</option>
                </select>
                <select v-model="filters.underwriterCode" class="border border-gray-300 rounded px-3 py-2 text-sm bg-white outline-none">
                    <option value="">全部保司</option>
                    <option v-for="c in companies" :key="c.code" :value="c.code">{{ c.name }}</option>
                </select>
            </div>

            <div v-if="sortMode" class="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-2 rounded">
                排序模式：使用上移/下移调整货架展示顺序，保存后写回 sortOrder。
            </div>

            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table class="min-w-full divide-y divide-gray-200 text-left">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase w-20">排序</th>
                            <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase">产品</th>
                            <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase">品类</th>
                            <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase">承保方</th>
                            <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase">月付价</th>
                            <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase">状态</th>
                            <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">操作</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
                        <tr v-for="p in filteredPlans" :key="p.planCode" class="hover:bg-gray-50 transition">
                            <td class="px-4 py-4">
                                <div v-if="sortMode" class="flex flex-col gap-1">
                                    <button type="button" @click="movePlan(p.planCode,-1)" class="text-[10px] font-bold text-gray-500 hover:text-opay">↑</button>
                                    <span class="font-mono text-xs text-center">{{ p.sortOrder }}</span>
                                    <button type="button" @click="movePlan(p.planCode,1)" class="text-[10px] font-bold text-gray-500 hover:text-opay">↓</button>
                                </div>
                                <span v-else class="font-mono text-xs text-gray-500">{{ p.sortOrder }}</span>
                            </td>
                            <td class="px-4 py-4">
                                <div class="font-bold text-gray-900">{{ p.planName }}</div>
                                <div class="text-xs font-mono text-gray-500">{{ p.planCode }}</div>
                            </td>
                            <td class="px-4 py-4">
                                <span class="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded">{{ categoryName(p.insuranceType) }}</span>
                            </td>
                            <td class="px-4 py-4 text-gray-700">{{ companyName(p.underwriterCode) }}</td>
                            <td class="px-4 py-4 font-mono text-xs">{{ formatMoney(p.monthlyPrice) }}</td>
                            <td class="px-4 py-4">
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded border" :class="shelfStatusClass(p)">
                                    {{ shelfStatusText(p) }}
                                </span>
                            </td>
                            <td class="px-4 py-4 text-right space-x-2 whitespace-nowrap">
                                <button @click="openView(p)" class="text-gray-500 hover:text-gray-900 font-bold text-xs">查看</button>
                                <button v-if="canEdit && !sortMode" @click="openEdit(p)" class="text-blue-600 hover:text-blue-800 font-bold text-xs">参数维护</button>
                            </td>
                        </tr>
                        <tr v-if="!filteredPlans.length">
                            <td colspan="7" class="px-4 py-10 text-center text-gray-400 text-sm">暂无保险产品</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <InsurancePlanForm v-if="showModal" v-model="editingPlan" :mode="modalMode"
                :categories="categories" :companies="companies"
                @close="showModal=false" @save="handleSave" />
        </div>
    `
};
