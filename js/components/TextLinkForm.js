import Modal from './Modal.js';

export default {
    components: { Modal },
    props: ['modelValue', 'mode'],
    emits: ['update:modelValue', 'close', 'save'],
    computed: {
        editingStrategy: {
            get() { return this.modelValue; },
            set(val) { this.$emit('update:modelValue', val); }
        },
        modalTitle() {
            return this.mode === 'create' ? '新建资产页引导文案' : '编辑资产页引导文案';
        }
    },
    methods: {
        handleSave() {
            const t = this.editingStrategy;
            if (!t.name) return alert('请输入策略管理名称');
            if (!t.crowd_rule) return alert('请输入人群标签');
            if (!t.display_text) return alert('请输入引导文案');
            if (t.weight === '' || t.weight === null) return alert('请输入优先级权重');

            this.$emit('save');
        }
    },
    template: `
        <Modal :title="modalTitle" @close="$emit('close')">
            <div class="flex-1 overflow-y-auto p-6 bg-gray-50 h-[550px] space-y-6">
                
                <!-- 基础信息与匹配规则 -->
                <div class="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h3 class="text-sm font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">基础与匹配规则</h3>
                    <div class="grid grid-cols-2 gap-5">
                        <div class="form-group">
                            <label class="label-std">策略管理名称 <span class="text-red-500">*</span></label>
                            <input v-model="editingStrategy.name" class="input-std" placeholder="内部管理名称 e.g. 理财未开户资产引导">
                        </div>
                        <div class="form-group">
                            <label class="label-std">策略 ID (Strategy ID)</label>
                            <input :value="editingStrategy.strategy_id" disabled class="input-std bg-gray-100 font-mono text-gray-500">
                        </div>
                        <div class="form-group">
                            <label class="label-std">人群标签 (Crowd Rule) <span class="text-red-500">*</span></label>
                            <input v-model="editingStrategy.crowd_rule" class="input-std font-bold text-blue-700" placeholder="e.g. 1023">
                            <p class="text-[10px] text-gray-400 mt-1">需与服务端实时数据源标签匹配</p>
                        </div>
                        <div class="form-group">
                            <label class="label-std">优先级权重 (Weight) <span class="text-red-500">*</span></label>
                            <input type="number" v-model="editingStrategy.weight" class="input-std font-mono" placeholder="数字越大优先级越高">
                        </div>
                        <div class="form-group">
                            <label class="label-std">生效开始时间 (Start Time) <span class="text-xs font-normal text-gray-400 ml-1">选填</span></label>
                            <input type="datetime-local" step="1" v-model="editingStrategy.start_time" class="input-std font-mono">
                        </div>
                        <div class="form-group">
                            <label class="label-std">生效结束时间 (End Time) <span class="text-xs font-normal text-gray-400 ml-1">选填</span></label>
                            <input type="datetime-local" step="1" v-model="editingStrategy.end_time" class="input-std font-mono">
                        </div>
                        <div class="form-group col-span-2 flex items-center justify-between bg-blue-50 p-3 rounded border border-blue-100 mt-2">
                            <div class="text-sm font-bold text-blue-800">策略状态 (Status)</div>
                            <div class="flex items-center gap-3">
                                <span class="text-xs font-bold" :class="editingStrategy.status === 1 ? 'text-blue-700' : 'text-gray-500'">
                                    {{ editingStrategy.status === 1 ? 'Enabled (启用中)' : 'Disabled (已停用)' }}
                                </span>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" v-model="editingStrategy.status" :true-value="1" :false-value="0" class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-opay"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 客户端展示配置 -->
                <div class="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h3 class="text-sm font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">触达内容配置 (Display)</h3>
                    <div class="space-y-5">
                        <div class="form-group">
                            <label class="label-std">引导文案 (Display Text) <span class="text-red-500">*</span></label>
                            <textarea v-model="editingStrategy.display_text" rows="3" class="input-std font-mono text-sm leading-relaxed" placeholder='Upgrade balance account to <font color="#31C086">get daily interest ></font>'></textarea>
                            <p class="text-[10px] text-gray-400 mt-1">支持前端标准富文本 HTML 标签，如 &lt;font color="#xxx"&gt;</p>
                        </div>
                        <div class="form-group">
                            <label class="label-std">跳转链接 (Link URL) <span class="text-xs font-normal text-gray-400 ml-1">选填，为空不可点击</span></label>
                            <input v-model="editingStrategy.link_url" class="input-std text-blue-600 font-mono" placeholder="https://...">
                        </div>
                    </div>
                </div>

            </div>
            
            <template #footer>
                <button @click="$emit('close')" class="px-5 py-2 text-gray-600 hover:bg-gray-200 rounded text-sm font-bold transition">取消</button>
                <button @click="handleSave" class="px-6 py-2 bg-opay hover:bg-opay-hover text-white rounded shadow text-sm font-bold transition">保存配置</button>
            </template>
        </Modal>
    `
};