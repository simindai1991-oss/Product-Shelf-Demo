import { PERMISSION_TREE } from '../utils.js';

export default {
    props: ['roles'],
    emits: ['save-role'],
    data() { 
        return { 
            showModal: false, 
            mode: 'edit', 
            editingRole: { name: '', code: '', permissions: [] },
            permTree: PERMISSION_TREE
        } 
    },
    methods: {
        initCreate() { 
            this.mode = 'create'; 
            this.editingRole = { name: '', code: 'NEW_ROLE', permissions: [] }; 
            this.showModal = true; 
        },
        editRole(r) { 
            this.mode = 'edit'; 
            this.editingRole = JSON.parse(JSON.stringify(r)); 
            if (!this.editingRole.permissions) this.editingRole.permissions = [];
            this.showModal = true; 
        },
        save() { 
            this.$emit('save-role', this.editingRole, this.mode); 
            this.showModal = false; 
        },
        hasPerm(pStr) {
            if (this.editingRole.permissions.includes('*')) return true;
            return this.editingRole.permissions.includes(pStr);
        },
        togglePerm(pStr) {
            if (this.editingRole.permissions.includes('*')) {
                alert("Super Admin permissions are fixed (*).");
                return;
            }
            const idx = this.editingRole.permissions.indexOf(pStr);
            if (idx > -1) {
                this.editingRole.permissions.splice(idx, 1);
            } else {
                this.editingRole.permissions.push(pStr);
            }
        },
        getPermCount(role) {
            if (!role.permissions) return '0 points';
            if (role.permissions.includes('*')) return 'ALL (Super Admin)';
            return role.permissions.length + ' points';
        }
    },
    template: `
        <div class="space-y-4">
            <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-gray-800">角色与权限配置</h3>
                    <button @click="initCreate" class="bg-opay text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-opay-hover">
                        + 新建角色
                    </button>
                </div>
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role Name</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Code</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Permissions Count</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <tr v-for="r in roles" :key="r.code">
                            <td class="px-6 py-4 font-bold text-sm">{{ r.name }}</td>
                            <td class="px-6 py-4 text-xs font-mono text-gray-500">{{ r.code }}</td>
                            <td class="px-6 py-4 text-xs">
                                <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">{{ getPermCount(r) }}</span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <button v-if="r.code !== 'SUPER_ADMIN'" @click="editRole(r)" class="text-opay text-xs font-bold hover:underline">配置权限</button>
                                <span v-else class="text-gray-400 text-xs italic">System Locked</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
                <div class="bg-white w-full max-w-3xl max-h-[90vh] rounded-xl shadow-xl flex flex-col">
                    <div class="px-6 py-4 border-b shrink-0">
                        <h3 class="text-lg font-bold text-gray-800">{{ mode === 'create' ? '新建角色' : '配置权限' }}</h3>
                    </div>
                    
                    <div class="p-6 overflow-y-auto flex-1 space-y-6">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="form-group">
                                <label class="label-std">角色名称</label>
                                <!-- Name is editable in both modes -->
                                <input v-model="editingRole.name" type="text" class="input-std">
                            </div>
                            <div class="form-group">
                                <label class="label-std">角色代码 (Code)</label>
                                <!-- Code is disabled in edit mode -->
                                <input v-model="editingRole.code" type="text" :disabled="mode === 'edit'" class="input-std">
                            </div>
                        </div>

                        <div class="border rounded-lg overflow-hidden">
                            <div class="bg-gray-100 px-4 py-2 text-xs font-bold text-gray-500 border-b flex justify-between items-center">
                                <span>权限配置 (Module > Resource > Action)</span>
                                <span class="text-[10px] text-gray-400">已选: {{ editingRole.permissions.length }}</span>
                            </div>
                            
                            <div class="divide-y divide-gray-100 bg-gray-50/50">
                                <div v-for="mod in permTree" :key="mod.code" class="p-4">
                                    <h4 class="text-sm font-bold text-gray-800 mb-3 flex items-center">
                                        <span class="w-2 h-2 bg-opay rounded-full mr-2"></span>
                                        {{ mod.name }}
                                    </h4>
                                    
                                    <div class="space-y-4 pl-4 border-l-2 border-gray-200 ml-1">
                                        <div v-for="res in mod.resources" :key="res.code" class="bg-white p-3 rounded border border-gray-100 shadow-sm">
                                            <h5 class="text-xs font-bold text-gray-600 mb-2 border-b pb-1">{{ res.name }}</h5>
                                            <div class="flex flex-wrap gap-x-6 gap-y-2">
                                                <label v-for="act in res.actions" :key="act.k" class="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 p-1 rounded -ml-1 transition">
                                                    <input type="checkbox" 
                                                           :checked="hasPerm(mod.code + ':' + res.code + ':' + act.k)"
                                                           @change="togglePerm(mod.code + ':' + res.code + ':' + act.k)"
                                                           class="accent-opay rounded w-4 h-4 cursor-pointer">
                                                    <span class="text-xs text-gray-700">{{ act.n }}</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
                        <button @click="showModal = false" class="text-gray-500 font-bold text-sm">取消</button>
                        <button @click="save" class="bg-opay text-white px-6 py-2 rounded text-sm font-bold shadow hover:bg-opay-hover">保存配置</button>
                    </div>
                </div>
            </div>
        </div>
    `
};