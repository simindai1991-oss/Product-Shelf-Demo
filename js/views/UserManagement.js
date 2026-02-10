export default {
    props: ['users', 'roles', 'hasPermission'],
    emits: ['add-user', 'update-user'], // Changed update-role to update-user
    data() { 
        return { 
            showModal: false,
            modalMode: 'add', // 'add' or 'edit' 
            editingUser: { id: null, name: '', roles: [] } 
        } 
    },
    methods: {
        getRoleName(code) { 
            const r = this.roles.find(r => r.code === code); 
            return r ? r.name : code; 
        },
        initAdd() {
            this.modalMode = 'add';
            this.editingUser = { id: null, name: '', roles: ['USER'] };
            this.showModal = true;
        },
        initEdit(u) {
            this.modalMode = 'edit';
            // Deep copy to avoid modifying prop directly
            this.editingUser = JSON.parse(JSON.stringify(u));
            // Ensure roles is array
            if (!Array.isArray(this.editingUser.roles)) {
                this.editingUser.roles = [this.editingUser.role]; // Legacy support
            }
            this.showModal = true;
        },
        toggleRole(roleCode) {
            const idx = this.editingUser.roles.indexOf(roleCode);
            if (idx > -1) {
                this.editingUser.roles.splice(idx, 1);
            } else {
                this.editingUser.roles.push(roleCode);
            }
        },
        confirmSave() { 
            if (this.editingUser.roles.length === 0) {
                alert("至少需要分配一个角色");
                return;
            }
            
            if (this.modalMode === 'add') {
                this.$emit('add-user', { ...this.editingUser }); 
            } else {
                this.$emit('update-user', { ...this.editingUser });
            }
            this.showModal = false; 
        }
    },
    template: `
        <div class="space-y-4">
            <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-gray-800">用户权限管理</h3>
                    <!-- Changed to OPay Green -->
                    <button @click="initAdd" class="bg-opay hover:bg-opay-hover text-white px-3 py-1.5 rounded text-xs font-bold transition">
                        + 添加用户
                    </button>
                </div>
                <ul class="divide-y divide-gray-100">
                    <li v-for="u in users" :key="u.id" class="py-3 flex justify-between items-center">
                        <div>
                            <div class="font-bold text-sm">{{ u.name }} <span class="text-xs text-gray-400 font-normal">(飞书账号)</span></div>
                            <div class="text-xs text-gray-500">ID: {{ u.id }}</div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex gap-1 flex-wrap justify-end max-w-xs">
                                <span v-for="rCode in (Array.isArray(u.role) ? u.role : (Array.isArray(u.roles) ? u.roles : [u.role]))" :key="rCode" 
                                      class="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                                    {{ getRoleName(rCode) }}
                                </span>
                            </div>
                            
                            <div class="flex items-center gap-2">
                                <button v-if="hasPermission('user_manage')" @click="initEdit(u)" class="text-opay hover:text-green-700 text-xs font-bold">
                                    编辑
                                </button>
                                <button v-if="hasPermission('user_manage')" class="text-gray-400 hover:text-red-500 text-xs">
                                    移除
                                </button>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>

            <!-- User Modal -->
            <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
                <div class="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">{{ modalMode === 'add' ? '添加用户' : '编辑用户权限' }}</h3>
                    <div class="space-y-4">
                        <div class="form-group">
                            <label class="label-std">飞书账号</label>
                            <!-- Name is typically read-only in edit for LDAP/Feishu sync, but editable for add -->
                            <input v-model="editingUser.name" type="text" placeholder="e.g. zhangsan" class="input-std" :disabled="modalMode === 'edit'">
                        </div>
                        <div class="form-group">
                            <label class="label-std">分配角色 (至少选一个)</label>
                            <div class="space-y-1 border rounded p-3 max-h-48 overflow-y-auto bg-gray-50">
                                <label v-for="role in roles" :key="role.code" class="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition">
                                    <input type="checkbox" 
                                           :checked="editingUser.roles.includes(role.code)"
                                           @change="toggleRole(role.code)"
                                           class="accent-opay w-4 h-4 rounded">
                                    <span class="text-sm text-gray-700">{{ role.name }}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end gap-3 mt-6">
                        <button @click="showModal = false" class="text-gray-500 font-bold text-sm">取消</button>
                        <button @click="confirmSave" class="bg-opay text-white px-4 py-2 rounded text-sm font-bold shadow hover:bg-opay-hover" :disabled="!editingUser.name">
                            {{ modalMode === 'add' ? '确认添加' : '保存修改' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
};