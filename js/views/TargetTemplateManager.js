import TargetTemplateForm from '../components/TargetTemplateForm.js';
import { formatMoney } from '../utils.js';

export default {
    components: { TargetTemplateForm },
    props: ['templates', 'items'],
    emits: ['create-template', 'update-template', 'delete-template'],
    data() {
        return { 
            showModal: false, 
            modalMode: 'create', 
            editingTpl: {},
            // Filter State
            filters: {
                keyword: '',
                recType: '',
                reasonType: '',
                status: '',
                visibility: ''
            },
            // 更新 rec_type 枚举值用于筛选栏
            recTypes: [
                'big_days', 'business', 'contribution', 'daily_spend', 
                'education', 'family', 'festival', 'furniture_and_appliances', 
                'large_payment', 'life_style', 'travel', 'wealth'
            ],
            reasonTypes: [
                { id: 0, name: 'Accomodation' }, { id: 1, name: 'Travel' }, { id: 2, name: 'Appliances' },
                { id: 3, name: 'Education' }, { id: 4, name: 'Business' }, { id: 5, name: 'Events' },
                { id: 7, name: 'Emergencies' }, { id: 8, name: 'Others' }, { id: 9, name: 'Festival' },
                { id: 10, name: 'Life' }, { id: 11, name: 'Family' }
            ]
        }
    },
    computed: {
        targetSkus() { return this.items.filter(i => i.product_code === 'Targets'); },
        
        filteredTemplates() {
            return this.templates.filter(t => {
                // 1. Keyword Search (Name, ID, Keywords)
                if (this.filters.keyword) {
                    const kw = this.filters.keyword.toLowerCase();
                    const matchName = t.name && t.name.toLowerCase().includes(kw);
                    const matchId = t.template_no && t.template_no.toLowerCase().includes(kw);
                    const matchKw = t.keywords && t.keywords.toLowerCase().includes(kw);
                    if (!matchName && !matchId && !matchKw) return false;
                }
                
                // 2. Rec Type
                if (this.filters.recType && t.rec_type !== this.filters.recType) return false;
                
                // 3. Reason Type
                if (this.filters.reasonType !== '' && t.reason_type != this.filters.reasonType) return false;
                
                // 4. Status (Enabled/Disabled)
                if (this.filters.status !== '') {
                    if (t.template_status != this.filters.status) return false;
                }

                // 5. Visibility (Show/Hide)
                if (this.filters.visibility !== '') {
                    if (t.is_show != this.filters.visibility) return false;
                }

                return true;
            }).sort((a, b) => (b.pinned_sorting || 0) - (a.pinned_sorting || 0)); 
        }
    },
    methods: {
        formatMoney,
        getEnableStatus(t) { return t.template_status === 1 ? 'Enabled' : 'Disabled'; },
        getShowStatus(t) { return t.is_show === 1 ? 'Visible' : 'Hidden'; },
        getStatusColor(status) { 
            return { 'Enabled': 'bg-green-100 text-green-800', 'Disabled': 'bg-red-100 text-red-800', 'Visible': 'text-blue-600', 'Hidden': 'text-gray-400' }[status] || 'bg-gray-100'; 
        },
        
        initCreate() { 
            this.modalMode = 'create'; 
            this.editingTpl = { 
                template_no: Date.now().toString(), 
                item_code: 'Targets', 
                name: '', 
                rec_type: 'festival', 
                reason_type: 9,
                icon: '',
                card_background: '',
                pinned_sorting: null,
                target_amount: 100000,
                target_amounts: [],
                target_amounts_desc: [],
                period_type: 2,
                template_status: 1,
                is_show: 1,
                expire_date: '2099-12-31'
            }; 
            this.showModal = true; 
        },
        openEdit(t) { 
            this.modalMode = 'edit'; 
            this.editingTpl = JSON.parse(JSON.stringify(t)); 
            if(!this.editingTpl.target_amounts) this.editingTpl.target_amounts = [];
            if(!this.editingTpl.target_amounts_desc) this.editingTpl.target_amounts_desc = [];
            this.showModal = true; 
        },
        handleDelete(t) {
            if (confirm(`确定要删除模板 "${t.name}" 吗？此操作不可恢复。`)) {
                this.$emit('delete-template', t);
            }
        },
        handleSave() {
            if (!this.editingTpl.item_code) this.editingTpl.item_code = 'Targets'; 
            this.$emit(this.modalMode === 'create' ? 'create-template' : 'update-template', this.editingTpl);
            this.showModal = false;
        },
        clearFilters() {
            this.filters = { keyword: '', recType: '', reasonType: '', status: '', visibility: '' };
        }
    },
    template: `
        <div class="space-y-6">
            <!-- Header & Toolbar -->
            <div class="flex flex-col gap-4">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-xl font-bold text-gray-800">Target 场景模板管理</h2>
                        <p class="text-xs text-gray-500 mt-1">Config Scenarios for Target Savings</p>
                    </div>
                    <button @click="initCreate" class="bg-opay hover:bg-green-600 text-white px-4 py-2 rounded shadow font-bold flex items-center gap-1 transition">
                        <span class="text-lg">+</span> Create Template
                    </button>
                </div>

                <!-- Filters Bar -->
                <div class="bg-white p-3 rounded border border-gray-200 shadow-sm flex flex-wrap gap-3 items-center">
                    <!-- Keyword Search -->
                    <div class="relative w-48">
                        <input v-model="filters.keyword" type="text" placeholder="Search Name/ID..." 
                               class="w-full border border-gray-300 rounded pl-8 pr-2 py-1.5 text-xs focus:border-opay focus:outline-none">
                        <svg class="w-3 h-3 absolute left-2.5 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>

                    <!-- Rec Type -->
                    <select v-model="filters.recType" class="border border-gray-300 rounded px-2 py-1.5 text-xs focus:border-opay outline-none bg-white">
                        <option value="">全部 Rec Type</option>
                        <option v-for="t in recTypes" :value="t">{{ t }}</option>
                    </select>

                    <!-- Reason Type -->
                    <select v-model="filters.reasonType" class="border border-gray-300 rounded px-2 py-1.5 text-xs focus:border-opay outline-none bg-white">
                        <option value="">全部 Reason Type</option>
                        <option v-for="rt in reasonTypes" :value="rt.id">{{ rt.id }} - {{ rt.name }}</option>
                    </select>

                    <!-- Status -->
                    <select v-model="filters.status" class="border border-gray-300 rounded px-2 py-1.5 text-xs focus:border-opay outline-none bg-white">
                        <option value="">全部状态</option>
                        <option value="1">Enabled (启用)</option>
                        <option value="0">Disabled (禁用)</option>
                    </select>

                    <!-- Visibility -->
                    <select v-model="filters.visibility" class="border border-gray-300 rounded px-2 py-1.5 text-xs focus:border-opay outline-none bg-white">
                        <option value="">全部可见性</option>
                        <option value="1">Show (展示)</option>
                        <option value="0">Hide (隐藏)</option>
                    </select>

                    <!-- Clear Btn -->
                    <button @click="clearFilters" class="text-xs text-gray-500 hover:text-opay underline ml-auto">
                        清空筛选
                    </button>
                    <span class="text-xs font-bold text-gray-400 border-l pl-3">共 {{ filteredTemplates.length }} 条</span>
                </div>
            </div>

            <!-- Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div v-for="tpl in filteredTemplates" :key="tpl.template_no" 
                     class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition relative group overflow-hidden flex flex-col">
                    
                    <!-- Card Body -->
                    <div class="p-5 flex-1 relative">
                        <div v-if="tpl.card_background" class="absolute inset-0 opacity-10 bg-cover bg-center z-0" :style="{backgroundImage: 'url(' + tpl.card_background + ')'}"></div>
                        
                        <div class="relative z-10">
                            <div class="flex justify-between items-start mb-4">
                                <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 overflow-hidden shrink-0">
                                    <img v-if="tpl.icon" :src="tpl.icon" class="w-full h-full object-cover">
                                    <span v-else class="text-2xl">🎯</span>
                                </div>
                                <div class="flex flex-col items-end gap-1">
                                    <span :class="getStatusColor(getEnableStatus(tpl))" class="text-[10px] px-2 py-0.5 rounded border font-bold uppercase">
                                        {{ getEnableStatus(tpl) }}
                                    </span>
                                    <span class="text-[10px] font-bold" :class="getStatusColor(getShowStatus(tpl))">
                                        {{ tpl.is_show ? '👁️ Shown' : '🚫 Hidden' }}
                                    </span>
                                </div>
                            </div>

                            <h3 class="font-bold text-gray-800 mb-1 truncate" :title="tpl.name">{{ tpl.name }}</h3>
                            <div class="text-[10px] text-gray-400 font-mono mb-3">ID: {{ tpl.template_no }}</div>

                            <div class="space-y-1 text-xs text-gray-600">
                                <div class="flex justify-between">
                                    <span>Type:</span>
                                    <span class="font-bold truncate ml-2 text-right" :title="tpl.rec_type">{{ tpl.rec_type || '-' }} ({{ tpl.reason_type }})</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Default:</span>
                                    <span class="font-bold">{{ formatMoney(tpl.target_amount) }}</span>
                                </div>
                                <div class="flex justify-between" v-if="tpl.pinned_sorting > 0">
                                    <span>Pinned Sorting:</span>
                                    <span class="bg-yellow-100 text-yellow-800 px-1 rounded font-bold">{{ tpl.pinned_sorting }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Actions Footer -->
                    <div class="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center relative z-10">
                        <div class="text-[10px] text-gray-400 truncate max-w-[100px]" :title="tpl.keywords">
                            Key: {{ tpl.keywords || '-' }}
                        </div>
                        <div class="flex gap-3">
                            <button @click="openEdit(tpl)" class="text-opay hover:text-green-700 font-bold text-xs">
                                Edit
                            </button>
                            <button @click="handleDelete(tpl)" class="text-gray-400 hover:text-red-600 font-bold text-xs">
                                Del
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Empty State -->
                <div v-if="filteredTemplates.length === 0" class="col-span-full py-12 text-center text-gray-400 bg-white border border-dashed rounded-lg">
                    <div class="text-2xl mb-2">🔍</div>
                    没有找到符合条件的模板
                </div>
            </div>

            <TargetTemplateForm v-if="showModal"
                v-model="editingTpl"
                :mode="modalMode"
                :target-items="targetSkus"
                @close="showModal = false"
                @save="handleSave"
            />
        </div>
    `
};