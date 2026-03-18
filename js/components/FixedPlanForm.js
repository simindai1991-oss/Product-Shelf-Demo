import Modal from './Modal.js';

export default {
    components: { Modal },
    props: ['modelValue', 'mode', 'fixedItems'],
    emits: ['update:modelValue', 'close', 'save', 'delete'],
    data() {
        return {
            activeTab: 'basic',
            tabs: [
                { id: 'basic', name: '基础信息' },
                { id: 'rates', name: '利率配置' },
                { id: 'limits', name: '额度规则' },
                { id: 'dates', name: '销售周期' }
            ],
            displayBenchmark: 0
        }
    },
    computed: {
        editingPlan: {
            get() { return this.modelValue; },
            set(val) { this.$emit('update:modelValue', val); }
        },
        modalTitle() {
            if (this.mode === 'view') return 'Fixed Special 详情 (View Only)';
            return this.mode === 'create' ? '发行 Fixed Special 单品' : '编辑单品要素';
        },
        isReadOnly() {
            return this.mode === 'view';
        }
    },
    created() {
        if (!this.editingPlan.rates || this.editingPlan.rates.length === 0) {
            this.editingPlan.rates = [{ stepMinAmount: 0, rate: 0, displayRate: 0 }];
        }
        if (this.editingPlan.benchmark_rate !== undefined) {
            this.displayBenchmark = parseFloat((this.editingPlan.benchmark_rate * 100).toFixed(2));
        } else {
            this.editingPlan.benchmark_rate = 0;
            this.displayBenchmark = 0;
        }
    },
    methods: {
        updateRealRate(row) {
            row.rate = row.displayRate / 100;
        },
        updateRealBenchmark() {
            this.editingPlan.benchmark_rate = this.displayBenchmark / 100;
        }
    },
    template: `
        <Modal :title="modalTitle" @close="$emit('close')">
            
            <div class="flex border-b border-gray-200 px-6 pt-2 space-x-6 bg-white sticky top-0 z-10 shrink-0">
                <button v-for="tab in tabs" :key="tab.id" 
                    @click="activeTab = tab.id"
                    :class="activeTab === tab.id ? 'border-opay text-opay' : 'border-transparent text-gray-500 hover:text-gray-700'"
                    class="pb-3 border-b-2 font-bold text-sm transition-colors">
                    {{ tab.name }}
                </button>
            </div>

            <div class="flex-1 overflow-y-auto p-6 bg-gray-50 h-96">
                
                <!-- Tab 1: Basic Info -->
                <div v-show="activeTab === 'basic'" class="space-y-4 bg-white p-5 rounded border border-gray-200">
                    <div class="grid grid-cols-4 gap-4">
                        <div class="form-group col-span-2">
                            <label class="label-std">单品名称 (Item Name) <span class="text-red-500">*</span></label>
                            <input v-model="editingPlan.name" class="input-std" placeholder="内部管理名称" :disabled="isReadOnly" :class="isReadOnly ? 'bg-gray-50' : ''">
                        </div>
                        <div class="form-group col-span-2">
                            <label class="label-std">对客别名 (App Alias) <span class="text-red-500">*</span></label>
                            <input v-model="editingPlan.alias" class="input-std" placeholder="App端展示名称" :disabled="isReadOnly" :class="isReadOnly ? 'bg-gray-50' : ''">
                        </div>
                        <div class="form-group col-span-2">
                            <label class="label-std">定向人群ID (4位数字) <span class="text-red-500">*</span></label>
                            <input v-model="editingPlan.target_audience_id" class="input-std" placeholder="e.g. 2350" :disabled="isReadOnly" :class="isReadOnly ? 'bg-gray-50' : ''">
                        </div>
                        <div class="form-group col-span-2" v-if="mode !== 'create'">
                            <label class="label-std">Item ID</label>
                            <input v-model="editingPlan.plan_id" disabled class="input-std bg-gray-100 text-gray-500 font-mono">
                        </div>
                    </div>
                </div>

                <!-- Tab 2: Rates -->
                <div v-show="activeTab === 'rates'" class="space-y-4 bg-white p-5 rounded border border-gray-200">
                    <div class="grid grid-cols-2 gap-6">
                        <div class="form-group">
                            <label class="label-std">年化利率 (APY) <span class="text-red-500">*</span></label>
                            <div class="relative">
                                <input type="number" v-model="editingPlan.rates[0].displayRate" @input="updateRealRate(editingPlan.rates[0])" 
                                       class="input-std font-bold text-xl text-opay pl-4 py-3" placeholder="0.00" :disabled="isReadOnly" :class="isReadOnly ? 'bg-gray-50' : ''">
                                <span class="absolute right-8 top-3 text-gray-400 font-bold">%</span>
                            </div>
                            <p class="text-[10px] text-gray-400 mt-1">对客展示收益率</p>
                        </div>
                        
                        <div class="form-group">
                            <label class="label-std">Benchmark 利率 (Cost Base)</label>
                            <div class="relative">
                                <input type="number" v-model="displayBenchmark" @input="updateRealBenchmark"
                                       class="input-std font-bold text-xl text-gray-700 pl-4 py-3" placeholder="0.00" :disabled="isReadOnly" :class="isReadOnly ? 'bg-gray-50' : ''">
                                <span class="absolute right-8 top-3 text-gray-400 font-bold">%</span>
                            </div>
                            <p class="text-[10px] text-gray-400 mt-1">用于计算预算成本 (Spread = APY - Benchmark)</p>
                        </div>
                    </div>
                </div>

                <!-- Tab 3: Limits -->
                <div v-show="activeTab === 'limits'" class="space-y-4 bg-white p-5 rounded border border-gray-200">
                    <div class="grid grid-cols-3 gap-4">
                        <div class="form-group">
                            <label class="label-std">发行总规模 (₦) <span class="text-red-500">*</span></label>
                            <input type="number" v-model="editingPlan.total_issuance_amount" class="input-std font-mono font-bold text-gray-700" :disabled="isReadOnly" :class="isReadOnly ? 'bg-gray-50' : ''">
                        </div>
                        <div class="form-group">
                            <label class="label-std">持有期限 (Days) <span class="text-red-500">*</span></label>
                            <input type="number" v-model="editingPlan.period_days" class="input-std" :disabled="isReadOnly" :class="isReadOnly ? 'bg-gray-50' : ''">
                        </div>
                        <div class="form-group">
                            <label class="label-std">起购金额 (₦) <span class="text-red-500">*</span></label>
                            <input type="number" v-model="editingPlan.min_sub_amount" class="input-std" :disabled="isReadOnly" :class="isReadOnly ? 'bg-gray-50' : ''">
                        </div>
                        <div class="form-group">
                            <label class="label-std">单笔上限 (₦) <span class="text-red-500">*</span></label>
                            <input type="number" v-model="editingPlan.max_single_sub" class="input-std" :disabled="isReadOnly" :class="isReadOnly ? 'bg-gray-50' : ''">
                        </div>
                        <div class="form-group">
                            <label class="label-std">累计限额 (₦) <span class="text-red-500">*</span></label>
                            <input type="number" v-model="editingPlan.cum_sub_limit" class="input-std" :disabled="isReadOnly" :class="isReadOnly ? 'bg-gray-50' : ''">
                        </div>
                    </div>
                </div>

                <!-- Tab 4: Dates (Updated to datetime-local) -->
                <div v-show="activeTab === 'dates'" class="space-y-4 bg-white p-5 rounded border border-gray-200">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="label-std">申购开始时间 (精确到秒) <span class="text-red-500">*</span></label>
                            <input type="datetime-local" step="1" v-model="editingPlan.sale_start_time" class="input-std font-mono" :disabled="isReadOnly" :class="isReadOnly ? 'bg-gray-50' : ''">
                        </div>
                        <div class="form-group">
                            <label class="label-std">申购截止时间 (精确到秒) <span class="text-red-500">*</span></label>
                            <input type="datetime-local" step="1" v-model="editingPlan.sale_end_time" class="input-std font-mono" :disabled="isReadOnly" :class="isReadOnly ? 'bg-gray-50' : ''">
                        </div>
                    </div>
                </div>

            </div>
            <template #footer>
                <button v-if="!isReadOnly && editingPlan.status === 'Draft'" @click="$emit('delete', editingPlan)" class="mr-auto px-4 py-2 text-red-600 hover:bg-red-50 rounded text-sm font-bold transition">删除草稿</button>
                <button @click="$emit('close')" class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded text-sm font-bold transition">
                    {{ isReadOnly ? '关闭' : '取消' }}
                </button>
                <button v-if="!isReadOnly" @click="$emit('save')" class="px-5 py-2 bg-opay hover:bg-opay-hover text-white rounded shadow text-sm font-bold transition">
                    {{ mode === 'create' ? '保存草稿' : '保存并提交' }}
                </button>
            </template>
        </Modal>
    `
};