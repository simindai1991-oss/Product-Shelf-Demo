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
                { id: 'money', name: '金额配置' },
                { id: 'rule', name: '规则配置' }
            ],
            // Rec Type Enum from CSV/Spec
            recTypes: [
                'festival', 'education', 'business', 'travel', 'life', 
                'family', 'emergencies', 'appliances', 'events', 'accomodation', 'others'
            ],
            // Reason Type Enum Mapping
            reasonTypes: [
                { id: 0, name: 'Accomodation' },
                { id: 1, name: 'Travel' },
                { id: 2, name: 'Appliances' },
                { id: 3, name: 'Education' },
                { id: 4, name: 'Business' },
                { id: 5, name: 'Events' },
                // 6 skipped
                { id: 7, name: 'Emergencies' },
                { id: 8, name: 'Others' },
                { id: 9, name: 'Festival' },
                { id: 10, name: 'Life' },
                { id: 11, name: 'Family' }
            ],
            periodTypes: [
                { id: 0, name: '每日 (Daily)' },
                { id: 1, name: '每周 (Weekly)' },
                { id: 2, name: '每月 (Monthly)' }
            ]
        }
    },
    computed: {
        editingTpl: {
            get() { return this.modelValue; },
            set(val) { this.$emit('update:modelValue', val); }
        },
        modalTitle() { return this.mode === 'create' ? '新建 Target 场景模板' : '编辑模板配置'; },
        targetAmountsStr: {
            get() { return (this.editingTpl.target_amounts || []).join(','); },
            set(val) { this.editingTpl.target_amounts = val.split(',').map(n => Number(n.trim())).filter(n => !isNaN(n)); }
        },
        targetAmountsDescStr: {
            get() { return (this.editingTpl.target_amounts_desc || []).join(','); },
            set(val) { this.editingTpl.target_amounts_desc = val.split(',').map(s => s.trim()); }
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
                
                <!-- 1. Basic Info -->
                <div v-show="activeTab === 'basic'" class="space-y-4 bg-white p-5 rounded border border-gray-200">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="label-std">模板名称</label>
                            <input v-model="editingTpl.name" class="input-std" placeholder="e.g. Buy a Car">
                        </div>
                        <div class="form-group">
                            <label class="label-std">Template No (Auto)</label>
                            <input v-model="editingTpl.template_no" disabled class="input-std bg-gray-100 font-mono text-gray-500">
                        </div>
                        <div class="form-group">
                            <label class="label-std">Rec Type</label>
                            <select v-model="editingTpl.rec_type" class="input-std">
                                <option v-for="t in recTypes" :value="t">{{ t }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="label-std">Reason Type</label>
                            <select v-model="editingTpl.reason_type" class="input-std">
                                <option v-for="rt in reasonTypes" :value="rt.id">{{ rt.id }} - {{ rt.name }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="label-std">Keywords (模糊匹配)</label>
                            <input v-model="editingTpl.keywords" class="input-std" placeholder="comma,separated,keywords">
                        </div>
                        <div class="form-group">
                            <label class="label-std">Base Members (展示基数)</label>
                            <input type="number" v-model="editingTpl.base_members" class="input-std">
                        </div>
                        <div class="form-group">
                            <label class="label-std">Pinned Sorting</label>
                            <input type="number" v-model="editingTpl.pinned_sorting" class="input-std" placeholder="为空则不置顶">
                        </div>
                    </div>
                </div>

                <!-- 2. Visual Config -->
                <div v-show="activeTab === 'visual'" class="space-y-4 bg-white p-5 rounded border border-gray-200">
                    <div class="grid grid-cols-1 gap-4">
                        <div class="form-group">
                            <label class="label-std">Icon URL</label>
                            <div class="flex gap-2">
                                <input v-model="editingTpl.icon" class="input-std flex-1" placeholder="https://...">
                                <img v-if="editingTpl.icon" :src="editingTpl.icon" class="w-10 h-10 object-contain border rounded bg-gray-100">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="label-std">Card Background URL</label>
                            <div class="flex gap-2">
                                <input v-model="editingTpl.card_background" class="input-std flex-1" placeholder="https://...">
                                <img v-if="editingTpl.card_background" :src="editingTpl.card_background" class="w-20 h-10 object-cover border rounded bg-gray-100">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3. Money Config -->
                <div v-show="activeTab === 'money'" class="space-y-4 bg-white p-5 rounded border border-gray-200">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="label-std">默认目标金额</label>
                            <input type="number" v-model="editingTpl.target_amount" class="input-std font-bold text-opay">
                        </div>
                        <div class="form-group">
                            <!-- Placeholder for alignment -->
                        </div>
                        <div class="form-group col-span-2">
                            <label class="label-std">快捷选项金额 (3 Options, comma separated)</label>
                            <input v-model="targetAmountsStr" class="input-std" placeholder="e.g. 200000, 500000, 1000000">
                            <div class="mt-1 flex gap-2">
                                <span v-for="amt in editingTpl.target_amounts" class="text-xs bg-gray-100 px-2 py-1 rounded">₦{{ Number(amt).toLocaleString() }}</span>
                            </div>
                        </div>
                        <div class="form-group col-span-2">
                            <label class="label-std">快捷选项描述 (3 Options, comma separated)</label>
                            <input v-model="targetAmountsDescStr" class="input-std" placeholder="e.g. Standard, Premium, Luxury">
                        </div>
                    </div>
                </div>

                <!-- 4. Rules & Status -->
                <div v-show="activeTab === 'rule'" class="space-y-4 bg-white p-5 rounded border border-gray-200">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="label-std">扣款周期类型</label>
                            <select v-model="editingTpl.period_type" class="input-std">
                                <option v-for="pt in periodTypes" :value="pt.id">{{ pt.name }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="label-std">建议持续天数</label>
                            <input type="number" v-model="editingTpl.duration" class="input-std" placeholder="Optional (days)">
                        </div>
                        <div class="form-group">
                            <label class="label-std">固定截止日期</label>
                            <input type="date" v-model="editingTpl.end_date" class="input-std">
                        </div>
                        <div class="form-group">
                            <label class="label-std">失效日期</label>
                            <input type="date" v-model="editingTpl.expire_date" class="input-std">
                        </div>
                        <div class="form-group border-t pt-4 mt-2">
                            <label class="label-std">Template Status (启用状态)</label>
                            <div class="flex gap-4 mt-2">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" v-model="editingTpl.template_status" :value="1" class="accent-opay"> 启用 (Enable)
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" v-model="editingTpl.template_status" :value="0" class="accent-gray-500"> 禁用 (Disable)
                                </label>
                            </div>
                        </div>
                        <div class="form-group border-t pt-4 mt-2">
                            <label class="label-std">Is Show (广场展示)</label>
                            <div class="flex gap-4 mt-2">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" v-model="editingTpl.is_show" :value="1" class="accent-opay"> 展示 (Show)
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" v-model="editingTpl.is_show" :value="0" class="accent-gray-500"> 隐藏 (Hide)
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <template #footer>
                <button @click="$emit('close')" class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded text-sm font-bold">取消</button>
                <button @click="$emit('save')" class="px-5 py-2 bg-opay hover:bg-opay-hover text-white rounded shadow text-sm font-bold">
                    保存配置
                </button>
            </template>
        </Modal>
    `
};