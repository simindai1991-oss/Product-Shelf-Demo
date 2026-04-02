import Modal from './Modal.js';

export default {
    components: { Modal },
    props: ['modelValue', 'mode'],
    emits: ['update:modelValue', 'close', 'save'],
    data() {
        return {
            activeTab: 'basic',
            tabs: [
                { id: 'basic', name: '命中规则' }, // 修改 Tab 名称
                { id: 'action', name: '触达配置 (Action)' }
            ],
            templates: {
                t1: "// 示例：未开通autosave\ncontext.isAutoSaveOpen == false",
                t2: "// 示例：拟转出金额 >= 5000 且目标银行是 Monie Point\ncontext.transferAmount >= 5000 && context.bankName == 'Monie Point'"
            }
        }
    },
    computed: {
        editingStrategy: {
            get() { return this.modelValue; },
            set(val) { this.$emit('update:modelValue', val); }
        },
        modalTitle() {
            return this.mode === 'create' ? '新建转账挽留策略' : '编辑转账挽留策略';
        },
        generatedJson() {
            const t = this.editingStrategy;
            const outputJSON = {
                show: !!t.show,
                strategyId: t.id || "STR-AUTO-GEN"
            };

            if (t.show) {
                outputJSON.popupType = t.popupType;
                outputJSON.protocolText = t.protocolText;
                outputJSON.protocolImage = "https://img.com/proto.png";
                outputJSON.urlTermsConditions = t.urlTermsConditions;
                outputJSON.urlPrivacyPolicy = t.urlPrivacyPolicy;

                const infoObj = {
                    icon: t.icon,
                    title: t.title,
                    brief: t.brief,
                    image: t.image,
                    buttonLeftTxt: t.buttonLeftTxt,
                    buttonRightTxt: t.buttonRightTxt
                };

                if (t.popupType === 'custom') {
                    infoObj.buttonUrl = t.buttonUrl;
                    outputJSON.AutoSaveCouponInfo = infoObj;
                } else {
                    outputJSON.AcInfo = infoObj;
                }
            }
            return JSON.stringify(outputJSON, null, 2);
        }
    },
    methods: {
        applyTemplate(key) {
            this.editingStrategy.script = this.templates[key];
        },
        insertVar(variable) {
            const textarea = this.$refs.scriptInput;
            const startPos = textarea.selectionStart;
            const endPos = textarea.selectionEnd;
            const currentVal = this.editingStrategy.script || '';
            
            this.editingStrategy.script = currentVal.substring(0, startPos) + variable + currentVal.substring(endPos);
            
            this.$nextTick(() => {
                textarea.focus();
                textarea.selectionStart = startPos + variable.length;
                textarea.selectionEnd = startPos + variable.length;
            });
        },
        handleSave() {
            const t = this.editingStrategy;
            if (!t.name) return alert('请输入策略名称');
            if (t.priority < 0 || t.priority > 99) return alert('优先级权重限制在 0~99 之间');
            if (!t.script) return alert('请输入命中逻辑 (Script)');
            
            if (t.show) {
                if (!t.protocolText) return alert('请输入协议文案');
                if (!t.title) return alert('请输入主标题');
            }

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

            <div class="flex-1 overflow-y-auto p-6 bg-gray-50 h-[500px]">
                
                <!-- Tab 1: 命中规则 -->
                <div v-show="activeTab === 'basic'" class="space-y-6">
                    <div class="bg-white p-5 rounded border border-gray-200 shadow-sm">
                        <h3 class="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">基础信息</h3>
                        <div class="grid grid-cols-4 gap-4">
                            <div class="col-span-2 form-group">
                                <label class="label-std">策略名称 <span class="text-red-500">*</span></label>
                                <input v-model="editingStrategy.name" class="input-std" placeholder="e.g. OWealth 未激活引导">
                            </div>
                            <div class="form-group">
                                <label class="label-std">优先级 (权重) <span class="text-red-500">*</span></label>
                                <input type="number" min="0" max="99" v-model="editingStrategy.priority" class="input-std font-mono" placeholder="0~99">
                            </div>
                            <div class="form-group">
                                <label class="label-std">归属人群 (人群ID) <span class="text-xs text-gray-400 font-normal ml-1">选填</span></label>
                                <input type="text" v-model="editingStrategy.target_audience_id" class="input-std font-mono" placeholder="不填则全客群">
                            </div>
                        </div>
                    </div>

                    <div class="bg-white p-5 rounded border border-gray-200 shadow-sm">
                        <div class="flex justify-between items-end mb-3">
                            <h3 class="text-sm font-bold text-gray-800">命中逻辑 (Script) <span class="text-red-500">*</span></h3>
                            <span class="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded">JS 表达式，返回 boolean</span>
                        </div>
                        
                        <div class="flex flex-wrap gap-2 mb-3 bg-opay-bg p-2 rounded border border-opay-light items-center">
                            <span class="text-xs text-opay font-bold mr-1">预设模板:</span>
                            <button @click="applyTemplate('t1')" class="px-2 py-1 bg-white border border-opay-light text-opay text-xs rounded hover:bg-opay-light transition">OWealth未激活引导</button>
                            <button @click="applyTemplate('t2')" class="px-2 py-1 bg-white border border-opay-light text-opay text-xs rounded hover:bg-opay-light transition">MP转账截留</button>
                        </div>

                        <div class="flex flex-wrap gap-2 mb-3 bg-gray-50 p-2 rounded border border-gray-100 items-center">
                            <span class="text-xs text-gray-500 font-bold mr-1">点击插入变量:</span>
                            <button @click="insertVar('context.bankName')" class="px-2 py-1 bg-white border border-gray-200 text-gray-600 text-xs rounded hover:border-opay hover:text-opay transition">目标银行</button>
                            <button @click="insertVar('context.transferAmount')" class="px-2 py-1 bg-white border border-gray-200 text-gray-600 text-xs rounded hover:border-opay hover:text-opay transition">转账金额</button>
                            <button @click="insertVar('context.availableBalance')" class="px-2 py-1 bg-white border border-gray-200 text-gray-600 text-xs rounded hover:border-opay hover:text-opay transition">可用余额</button>
                            <button @click="insertVar('context.isAutoSaveOpen')" class="px-2 py-1 bg-white border border-gray-200 text-gray-600 text-xs rounded hover:border-opay hover:text-opay transition">AutoSave状态</button>
                        </div>

                        <textarea ref="scriptInput" v-model="editingStrategy.script" rows="4" class="w-full px-3 py-3 bg-gray-900 text-green-400 font-mono text-sm rounded border-none focus:ring-1 focus:ring-opay outline-none resize-y" spellcheck="false"></textarea>
                    </div>
                </div>

                <!-- Tab 2: 触达配置 -->
                <div v-show="activeTab === 'action'" class="space-y-6">
                    <div class="bg-white p-5 rounded border border-gray-200 shadow-sm relative">
                        <div class="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200 mb-6">
                            <div class="text-sm font-bold text-gray-800">是否显示弹窗 (Show)</div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" v-model="editingStrategy.show" class="sr-only peer">
                                <div class="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-opay"></div>
                            </label>
                        </div>

                        <div v-if="editingStrategy.show" class="space-y-6 animate-fade-in">
                            <div class="w-1/2 pr-3 form-group">
                                <label class="label-std">弹窗类型 (popupType) <span class="text-red-500">*</span></label>
                                <select v-model="editingStrategy.popupType" class="input-std bg-white">
                                    <option value="custom">custom (有权益配置)</option>
                                    <option value="autosave">autosave (无权益配置)</option>
                                </select>
                            </div>

                            <div class="p-4 border border-gray-200 rounded">
                                <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">协议与合规设置</div>
                                <div class="grid grid-cols-3 gap-4">
                                    <div class="form-group">
                                        <label class="label-std">协议文案 (protocolText) <span class="text-red-500">*</span></label>
                                        <input v-model="editingStrategy.protocolText" class="input-std">
                                    </div>
                                    <div class="form-group">
                                        <label class="label-std">T&C 跳转链接 <span class="text-red-500">*</span></label>
                                        <input v-model="editingStrategy.urlTermsConditions" class="input-std">
                                    </div>
                                    <div class="form-group">
                                        <label class="label-std">隐私协议跳转 <span class="text-red-500">*</span></label>
                                        <input v-model="editingStrategy.urlPrivacyPolicy" class="input-std">
                                    </div>
                                </div>
                            </div>

                            <div class="p-4 border border-opay-light bg-opay-bg rounded">
                                <div class="text-xs font-bold text-opay uppercase tracking-wider mb-3">弹窗内容配置</div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="form-group">
                                        <label class="label-std">主标题 (title) <span class="text-red-500">*</span></label>
                                        <input v-model="editingStrategy.title" class="input-std">
                                    </div>
                                    <div class="form-group">
                                        <label class="label-std">副标题 (brief) <span class="text-red-500">*</span></label>
                                        <input v-model="editingStrategy.brief" class="input-std">
                                    </div>
                                    <div class="form-group">
                                        <label class="label-std">图标 URL (icon)</label>
                                        <input v-model="editingStrategy.icon" class="input-std">
                                    </div>
                                    <div class="form-group">
                                        <label class="label-std">展示大图 URL (image)</label>
                                        <input v-model="editingStrategy.image" class="input-std">
                                    </div>
                                    <div class="form-group">
                                        <label class="label-std">左按钮文案</label>
                                        <input v-model="editingStrategy.buttonLeftTxt" class="input-std">
                                    </div>
                                    <div class="form-group">
                                        <label class="label-std">右按钮文案</label>
                                        <input v-model="editingStrategy.buttonRightTxt" class="input-std">
                                    </div>
                                    <div class="form-group col-span-2" v-if="editingStrategy.popupType === 'custom'">
                                        <label class="label-std">跳转按钮 URL <span class="text-red-500">*</span></label>
                                        <input v-model="editingStrategy.buttonUrl" class="input-std">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- JSON 预览 -->
                        <div class="mt-6 border-t pt-4">
                            <div class="text-xs font-bold text-gray-500 mb-2">生成的结构体预览 (Read-only)</div>
                            <pre class="w-full p-4 bg-gray-900 text-gray-300 rounded text-xs font-mono overflow-x-auto">{{ generatedJson }}</pre>
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