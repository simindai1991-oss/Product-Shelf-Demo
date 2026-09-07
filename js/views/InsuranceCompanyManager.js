export default {
    props: ['companies', 'hasPermission'],
    emits: ['create-company', 'update-company'],
    data() {
        return {
            showModal: false,
            modalMode: 'create',
            form: { code: '', name: '', shortName: '', description: '', status: 'Active', sortOrder: 1 }
        };
    },
    computed: {
        canEdit() { return this.hasPermission('INSURANCE_MGMT:COMPANY:EDIT'); },
        canCreate() { return this.hasPermission('INSURANCE_MGMT:COMPANY:CREATE'); },
        sorted() {
            return [...(this.companies || [])].sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
        }
    },
    methods: {
        openCreate() {
            const next = this.companies.length
                ? Math.max(...this.companies.map(c => c.sortOrder || 0)) + 1
                : 1;
            this.modalMode = 'create';
            this.form = { code: '', name: '', shortName: '', description: '', status: 'Active', sortOrder: next };
            this.showModal = true;
        },
        openEdit(c) {
            this.modalMode = 'edit';
            this.form = JSON.parse(JSON.stringify(c));
            this.showModal = true;
        },
        save() {
            if (!this.form.code || !this.form.name) {
                alert('请填写保司编码与名称');
                return;
            }
            this.form.code = String(this.form.code).trim().toUpperCase();
            if (!this.form.shortName) this.form.shortName = this.form.code;
            if (this.modalMode === 'create') {
                if ((this.companies || []).some(c => c.code === this.form.code)) {
                    alert('保司编码已存在');
                    return;
                }
                this.$emit('create-company', { ...this.form });
            } else {
                this.$emit('update-company', { ...this.form });
            }
            this.showModal = false;
        }
    },
    template: `
        <div class="space-y-6">
            <div class="flex justify-between items-start">
                <div>
                    <h2 class="text-xl font-bold text-gray-800">保险公司管理</h2>
                </div>
                <button v-if="canCreate" @click="openCreate" class="bg-opay hover:bg-opay-hover text-white px-4 py-2 rounded shadow text-sm font-bold">+ 新保司</button>
            </div>

            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">编码</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">名称</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">简称</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">说明</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">状态</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">操作</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
                        <tr v-for="c in sorted" :key="c.code" class="hover:bg-gray-50">
                            <td class="px-6 py-4 font-mono text-xs">{{ c.code }}</td>
                            <td class="px-6 py-4 font-bold text-gray-900">{{ c.name }}</td>
                            <td class="px-6 py-4 text-gray-700">{{ c.shortName }}</td>
                            <td class="px-6 py-4 text-gray-500 text-xs">{{ c.description || '—' }}</td>
                            <td class="px-6 py-4">
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded border"
                                    :class="c.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'">
                                    {{ c.status }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <button v-if="canEdit" @click="openEdit(c)" class="text-blue-600 font-bold text-xs">编辑</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="showModal" class="fixed inset-0 z-[9999] flex items-center justify-center">
                <div class="absolute inset-0 bg-black/50" @click="showModal=false"></div>
                <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 m-4">
                    <h3 class="font-bold text-gray-800">{{ modalMode === 'create' ? '新建保险公司' : '编辑保险公司' }}</h3>
                    <div class="form-group">
                        <label class="label-std">编码 code *</label>
                        <input v-model="form.code" :disabled="modalMode==='edit'" class="input-std font-mono uppercase" :class="modalMode==='edit' ? 'bg-gray-100' : ''" placeholder="NEM / AIICO">
                    </div>
                    <div class="form-group">
                        <label class="label-std">全称 *</label>
                        <input v-model="form.name" class="input-std">
                    </div>
                    <div class="form-group">
                        <label class="label-std">简称 shortName</label>
                        <input v-model="form.shortName" class="input-std" placeholder="端内展示用">
                    </div>
                    <div class="form-group">
                        <label class="label-std">说明</label>
                        <input v-model="form.description" class="input-std">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="form-group">
                            <label class="label-std">排序</label>
                            <input type="number" v-model.number="form.sortOrder" class="input-std">
                        </div>
                        <div class="form-group">
                            <label class="label-std">状态</label>
                            <select v-model="form.status" class="input-std">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 pt-2">
                        <button @click="showModal=false" class="text-sm font-bold text-gray-500 px-3 py-2">取消</button>
                        <button @click="save" class="bg-opay text-white text-sm font-bold px-4 py-2 rounded">保存</button>
                    </div>
                </div>
            </div>
        </div>
    `
};
