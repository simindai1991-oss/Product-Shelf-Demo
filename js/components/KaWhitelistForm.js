import Modal from './Modal.js';

export default {
    components: { Modal },
    props: ['modelValue', 'mode'],
    emits: ['update:modelValue', 'close', 'save'],
    data() {
        return {
            manualInput: '',
            uploadedFileName: ''
        }
    },
    computed: {
        editingWhitelist: {
            get() { return this.modelValue; },
            set(val) { this.$emit('update:modelValue', val); }
        },
        modalTitle() {
            return this.mode === 'create' ? '新建 KA 白名单人群' : '编辑 KA 白名单人群';
        },
        userCount() {
            if (!this.manualInput.trim()) return 0;
            return this.manualInput.split('\n').filter(l => l.trim()).length;
        }
    },
    created() {
        if (this.mode === 'edit' && this.editingWhitelist.users) {
            this.manualInput = this.editingWhitelist.users.join('\n');
        }
    },
    methods: {
        handleFileUpload(e) {
            const file = e.target.files[0];
            if (!file) return;
            this.uploadedFileName = file.name;
            
            const reader = new FileReader();
            reader.onload = (evt) => {
                const text = evt.target.result;
                const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
                
                // 跳过可能存在的 CSV Header（比如 "Merchant ID"），仅抽取纯数字的行作为用户ID
                const newIds = lines.filter(l => /^\d+$/.test(l)); 
                
                // 将新导入的 ID 与当前的输入框中的 ID 合并去重（增量更新）
                const currentIds = this.manualInput.split('\n').map(l => l.trim()).filter(l => l);
                const allSet = new Set([...currentIds, ...newIds]);
                
                this.manualInput = Array.from(allSet).join('\n');
                e.target.value = null; // 重置 input 以支持重复选择同名文件
            };
            reader.readAsText(file);
        },
        downloadTemplate() {
            // 根据要求，首行为 "Merchant ID"，后跟用户数据范例
            const csvContent = "Merchant ID\n256626040238006\n256626040201931\n";
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "上传数据模板.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        handleSave() {
            if (!this.editingWhitelist.name) return alert('请输入白名单名称');
            
            const users = this.manualInput.split('\n').map(l => l.trim()).filter(l => l);
            this.editingWhitelist.users = users;
            this.editingWhitelist.count = users.length;
            
            this.$emit('save');
        }
    },
    template: `
        <Modal :title="modalTitle" @close="$emit('close')">
            <div class="p-6 bg-gray-50 h-[500px] overflow-y-auto space-y-6">
                
                <div class="bg-white p-5 rounded border border-gray-200 shadow-sm">
                    <h3 class="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">基础信息</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="label-std">白名单名称 <span class="text-red-500">*</span></label>
                            <input v-model="editingWhitelist.name" class="input-std" placeholder="内部管理名称 e.g. 核心商家群">
                        </div>
                        <div class="form-group">
                            <label class="label-std">白名单 ID (自增)</label>
                            <input :value="editingWhitelist.id" disabled class="input-std bg-gray-100 font-mono text-gray-500">
                        </div>
                    </div>
                </div>

                <div class="bg-white p-5 rounded border border-gray-200 shadow-sm">
                    <div class="flex justify-between items-end mb-3">
                        <h3 class="text-sm font-bold text-gray-800">人群数据 (Merchant ID)</h3>
                        <div class="text-xs font-bold flex items-center gap-2 bg-blue-50 px-2 py-1 rounded text-blue-700 border border-blue-100">
                            <span>当前识别有效人数: {{ userCount }} 人</span>
                        </div>
                    </div>

                    <!-- 增量更新与CSV文件上传交互区 -->
                    <div class="flex items-center gap-3 mb-4 p-3 bg-opay-bg border border-opay-light rounded">
                        <label class="cursor-pointer bg-white border border-opay text-opay hover:bg-opay hover:text-white px-3 py-1.5 rounded text-xs font-bold transition shadow-sm">
                            <span>📂 导入 CSV 增量更新</span>
                            <input type="file" class="hidden" accept=".csv" @change="handleFileUpload">
                        </label>
                        <a href="#" @click.prevent="downloadTemplate" class="text-xs text-blue-500 hover:text-blue-700 underline font-medium">下载数据模板</a>
                        <span v-if="uploadedFileName" class="text-xs text-gray-500 ml-auto flex items-center gap-1 font-mono">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            {{ uploadedFileName }}
                        </span>
                    </div>

                    <div class="form-group">
                        <label class="label-std">手动录入 (支持换行，每行一条数据)</label>
                        <textarea v-model="manualInput" rows="10" class="input-std font-mono text-xs leading-relaxed resize-y bg-gray-900 text-green-400" placeholder="256626040238006&#10;256626040201931..."></textarea>
                    </div>
                </div>

            </div>
            
            <template #footer>
                <button @click="$emit('close')" class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded text-sm font-bold transition">取消</button>
                <button @click="handleSave" class="px-6 py-2 bg-opay hover:bg-opay-hover text-white rounded shadow text-sm font-bold transition">保存生效</button>
            </template>
        </Modal>
    `
};