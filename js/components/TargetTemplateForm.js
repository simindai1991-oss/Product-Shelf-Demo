import Modal from './Modal.js';

export default {
    components: { Modal },
    props: ['modelValue', 'mode', 'targetItems'],
    emits: ['update:modelValue', 'close', 'save'],
    data() {
        return {
            activeTab: 'basic',
            tabs: [
                { id: 'basic', name: '基础信息' },
                { id: 'visual', name: '视觉配置' },
                { id: 'amount', name: '金额配置' },
                { id: 'rules', name: '规则配置' }
            ],
            recTypes: ['festival', 'education', 'business', 'travel', 'life', 'family', 'emergencies', 'appliances', 'events', 'accomodation', 'others'],
            reasonTypes: [
                { id: 0, name: 'Accomodation' }, { id: 1, name: 'Travel' }, { id: 2, name: 'Appliances' },
                { id: 3, name: 'Education' }, { id: 4, name: 'Business' }, { id: 5, name: 'Events' },
                { id: 7, name: 'Emergencies' }, { id: 8, name: 'Others' }, { id: 9, name: 'Festival' },
                { id: 10, name: 'Life' }, { id: 11, name: 'Family' }
            ]
        }
    },
    computed: {
        editingTpl: {
            get() { return this.modelValue; },
            set(val) { this.$emit('update:modelValue', val); }
        },
        modalTitle() {
            return this.mode === 'create' ? '新建 Target 场景模板' : '编辑模板配置';
        }
    },
    created() {
        // 初始化辅助字段：将数组转换为逗号分隔的字符串以供编辑
        this.editingTpl._amountsStr = Array.isArray(this.editingTpl.target_amounts) ? this.editingTpl.target_amounts.join(',') : '';
        this.editingTpl._amountsDescStr = Array.isArray(this.editingTpl.target_amounts_desc) ? this.editingTpl.target_amounts_desc.join(',') : '';
    },
    methods: {
        handleSave() {
            const t = this.editingTpl;

            // --- 校验必填项 ---
            // 1. 基础信息
            if (!t.name) return alert('【基础信息】请输入模板名称');
            if (!t.rec_type) return alert('【基础信息】请选择 Rec Type');
            if (t.reason_type === '' || t.reason_type === null) return alert('【基础信息】请选择 Reason Type');
            if (!t.keywords) return alert('【基础信息】请输入 Keywords');
            if (t.base_members === '' || t.base_members === null) return alert('【基础信息】请输入 Base Members');

            // 2. 视觉配置
            if (!t.icon) return alert('【视觉配置】请输入 Icon URL');
            if (!t.card_background) return alert('【视觉配置】请输入 Card Background URL');

            // 3. 金额配置
            if (!t.target_amount) return alert('【金额配置】请输入默认目标金额');
            if (!t._amountsStr) return alert('【金额配置】请输入快捷金额选项');

            // 4. 规则配置
            if (t.period_type === '' || t.period_type === null) return alert('【规则配置】请选择扣款周期类型');
            if (!t.expire_date) return alert('【规则配置】请选择失效日期');

            // --- 解析逗号分隔的金额及描述字符串为数组 ---
            t.target_amounts = t._amountsStr ? t._amountsStr.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0) : [];
            t.target_amounts_desc = t._amountsDescStr ? t._amountsDescStr.split(',').map(s => s.trim()) : [];

            this.$emit('save');
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
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="label-std">模板名称 <span class="text-red-500">*</span></label>
                            <input v-model="editingTpl.name" class="input-std" placeholder="e.g. Christmas 2026">
                        </div>
                        <div class="form-group">
                            <label class="label-std">Template ID</label>
                            <input v-model="editingTpl.template_no" disabled class="input-std bg-gray-100 text-gray-500 font-mono">
                        </div>
                        <div class="form-group">
                            <label class="label-std">Rec Type <span class="text-red-500">*</span></label>
                            <select v-model="editingTpl.rec_type" class="input-std bg-white">
                                <option value="" disabled>请选择...</option>
                                <option v-for="t in recTypes" :value="t">{{ t }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="label-std">Reason Type <span class="text-red-500">*</span></label>
                            <select v-model="editingTpl.reason_type" class="input-std bg-white">
                                <option value="" disabled>请选择...</option>
                                <option v-for="rt in reasonTypes" :value="rt.id">{{ rt.id }} - {{ rt.name }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="label-std">Keywords (搜索关键字) <span class="text-red-500">*</span></label>
                            <input v-model="editingTpl.keywords" class="input-std" placeholder="逗号分隔 e.g. xmas,santa">
                        </div>
                        <div class="form-group">
                            <label class="label-std">Base Members (基础人数) <span class="text-red-500">*</span></label>
                            <input type="number" v-model="editingTpl.base_members" class="input-std" placeholder="e.g. 1000">
                        </div>
                        <div class="form-group col-span-2">
                            <label class="label-std">Pinned Sorting (置顶排序权重)</label>
                            <input type="number" v-model="editingTpl.pinned_sorting" class="input-std" placeholder="数字越大越靠前 (留空则不置顶)">
                        </div>
                    </div>
                </div>

                <!-- Tab 2: Visual Config -->
                <div v-show="activeTab === 'visual'" class="space-y-4 bg-white p-5 rounded border border-gray-200">
                    <div class="form-group">
                        <label class="label-std">Icon URL <span class="text-red-500">*</span></label>
                        <input v-model="editingTpl.icon" class="input-std" placeholder="https://...">
                    </div>
                    <div class="form-group">
                        <label class="label-std">Card Background URL <span class="text-red-500">*</span></label>
                        <input v-model="editingTpl.card_background" class="input-std" placeholder="https://...">
                    </div>
                </div>

                <!-- Tab 3: Amounts -->
                <div v-show="activeTab === 'amount'" class="space-y-4 bg-white p-5 rounded border border-gray-200">
                    <div class="form-group">
                        <label class="label-std">默认目标金额 (Default Amount) <span class="text-red-500">*</span></label>
                        <input type="number" v-model="editingTpl.target_amount" class="input-std" placeholder="e.g. 1000000">
                    </div>
                    
                    <div class="border-t border-gray-100 pt-4 mt-2">
                        <h4 class="text-sm font-bold text-gray-800 mb-3">快捷选项配置 (Shortcut Options)</h4>
                        
                        <div class="space-y-4">
                            <div class="form-group">
                                <label class="label-std">快捷金额选项 (逗号分隔) <span class="text-red-500">*</span></label>
                                <input v-model="editingTpl._amountsStr" class="input-std" placeholder="e.g. 500000,1000000,2000000">
                            </div>
                            <div class="form-group">
                                <label class="label-std">快捷选项描述 (逗号分隔)</label>
                                <input v-model="editingTpl._amountsDescStr" class="input-std" placeholder="e.g. Standard,Premium,Luxurious">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab 4: Rules -->
                <div v-show="activeTab === 'rules'" class="space-y-4 bg-white p-5 rounded border border-gray-200">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="label-std">扣款周期类型 (Period Type) <span class="text-red-500">*</span></label>
                            <select v-model="editingTpl.period_type" class="input-std bg-white">
                                <option :value="0">0 - 任意时间 (Any)</option>
                                <option :value="1">1 - 每日 (Daily)</option>
                                <option :value="2">2 - 每月 (Monthly)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="label-std">建议持续天数 (Duration)</label>
                            <input type="number" v-model="editingTpl.duration" class="input-std" placeholder="e.g. 90">
                        </div>
                        <div class="form-group">
                            <label class="label-std">固定截止日期 (End Date)</label>
                            <input type="date" v-model="editingTpl.end_date" class="input-std font-mono">
                        </div>
                        <div class="form-group">
                            <label class="label-std">失效日期 (Expire Date) <span class="text-red-500">*</span></label>
                            <input type="date" v-model="editingTpl.expire_date" class="input-std font-mono text-opay">
                        </div>
                    </div>
                    
                    <div class="border-t border-gray-100 pt-4 mt-2 grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="label-std">系统状态 (System Status)</label>
                            <select v-model="editingTpl.template_status" class="input-std bg-white font-bold">
                                <option :value="1">1 - 启用 (Enabled)</option>
                                <option :value="0">0 - 禁用 (Disabled)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="label-std">对客可见性 (Visibility)</label>
                            <select v-model="editingTpl.is_show" class="input-std bg-white font-bold">
                                <option :value="1">1 - 展示 (Show)</option>
                                <option :value="0">0 - 隐藏 (Hide)</option>
                            </select>
                        </div>
                    </div>
                </div>

            </div>
            
            <template #footer>
                <button @click="$emit('close')" class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded text-sm font-bold transition">取消</button>
                <button @click="handleSave" class="px-6 py-2 bg-opay hover:bg-opay-hover text-white rounded shadow text-sm font-bold transition">保存配置</button>
            </template>
        </Modal>
    `
};