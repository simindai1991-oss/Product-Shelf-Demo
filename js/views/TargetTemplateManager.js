import TargetTemplateForm from '../components/TargetTemplateForm.js';
import { formatMoney } from '../utils.js';

export default {
    components: { TargetTemplateForm },
    props: ['templates', 'items'],
    emits: ['create-template', 'update-template'],
    data() {
        return { showModal: false, modalMode: 'create', editingTpl: {} }
    },
    computed: {
        targetSkus() { return this.items.filter(i => i.product_code === 'Targets'); },
        sortedTemplates() { return [...this.templates].sort((a, b) => b.pinned_sorting - a.pinned_sorting); } 
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
                reason_type: 8,
                icon: '',
                card_background: '',
                pinned_sorting: null,
                target_amount: 100000,
                target_amounts: [],
                target_amounts_desc: [],
                period_type: 2,
                template_status: 1,
                is_show: 1
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
        handleSave() {
            if (!this.editingTpl.item_code) this.editingTpl.item_code = 'Targets'; 
            
            this.$emit(this.modalMode === 'create' ? 'create-template' : 'update-template', this.editingTpl);
            this.showModal = false;
        }
    },
    template: `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-xl font-bold text-gray-800">Target 场景模板管理</h2>
                    <p class="text-xs text-gray-500 mt-1">Config Scenarios for Target Savings</p>
                </div>
                <button @click="initCreate" class="bg-opay hover:bg-green-600 text-white px-4 py-2 rounded shadow font-bold flex items-center gap-1 transition">
                    <span class="text-lg">+</span> Create Template
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div v-for="tpl in sortedTemplates" :key="tpl.template_no" 
                     class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition relative group overflow-hidden flex flex-col">
                    
                    <!-- Card Body -->
                    <div class="p-5 flex-1 relative">
                        <!-- BG Preview (faded) -->
                        <div v-if="tpl.card_background" class="absolute inset-0 opacity-10 bg-cover bg-center z-0" :style="{backgroundImage: 'url(' + tpl.card_background + ')'}"></div>
                        
                        <div class="relative z-10">
                            <div class="flex justify-between items-start mb-4">
                                <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 overflow-hidden">
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
                                    <span class="font-bold">{{ tpl.rec_type || '-' }} ({{ tpl.reason_type }})</span>
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
                        <button @click="openEdit(tpl)" class="text-opay hover:text-green-700 font-bold text-xs">
                            Edit Config
                        </button>
                    </div>
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