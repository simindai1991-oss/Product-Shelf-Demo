import { PERMISSION_TREE } from '../utils.js';

export default {
    props: ['roles', 'hasPermission'],
    emits: ['save-role'],
    data() { 
        return { 
            showModal: false, 
            mode: 'edit', 
            editingRole: { name: '', code: '', permissions: [] },
            permTree: PERMISSION_TREE,
            expandedModules: [] // 存储展开的模块Code
        } 
    },
    methods: {
        initCreate() { 
            this.mode = 'create'; 
            this.editingRole = { name: '', code: 'NEW_ROLE', permissions: [] }; 
            // 默认展开所有模块，方便查看
            this.expandAll();
            this.showModal = true; 
        },
        editRole(r) { 
            this.mode = 'edit'; 
            this.editingRole = JSON.parse(JSON.stringify(r)); 
            if (!this.editingRole.permissions) this.editingRole.permissions = [];
            this.expandAll();
            this.showModal = true; 
        },
        expandAll() {
            this.expandedModules = this.permTree.map(m => m.code);
        },
        save() { 
            this.$emit('save-role', this.editingRole, this.mode); 
            this.showModal = false; 
        },
        
        // --- Permission Logic ---
        
        // 判断单个权限是否拥有
        hasPerm(pStr) {
            if (this.editingRole.permissions.includes('*')) return true;
            return this.editingRole.permissions.includes(pStr);
        },

        // 切换单个权限
        togglePerm(pStr) {
            if (!this.canEdit) return;
            if (this.editingRole.permissions.includes('*')) return alert("Super Admin permissions are fixed (*).");
            
            const idx = this.editingRole.permissions.indexOf(pStr);
            if (idx > -1) this.editingRole.permissions.splice(idx, 1);
            else this.editingRole.permissions.push(pStr);
        },

        // 切换模块展开/折叠
        toggleExpand(code) {
            const idx = this.expandedModules.indexOf(code);
            if (idx > -1) this.expandedModules.splice(idx, 1);
            else this.expandedModules.push(code);
        },

        // 获取模块下所有可能的权限key列表
        getModuleAllPerms(mod) {
            const perms = [];
            mod.resources.forEach(res => {
                res.actions.forEach(act => {
                    perms.push(`${mod.code}:${res.code}:${act.k}`);
                });
            });
            return perms;
        },

        // 获取模块选中状态: 0=未选, 1=部分选, 2=全选
        getModuleCheckState(mod) {
            if (this.editingRole.permissions.includes('*')) return 2;
            const all = this.getModuleAllPerms(mod);
            const selected = all.filter(p => this.editingRole.permissions.includes(p));
            
            if (selected.length === 0) return 0;
            if (selected.length === all.length) return 2;
            return 1;
        },

        // 切换模块全选
        toggleModuleAll(mod) {
            if (!this.canEdit) return;
            const state = this.getModuleCheckState(mod);
            const allPerms = this.getModuleAllPerms(mod);
            
            if (state === 2) { 
                // 全选 -> 全不选 (移除该模块下所有权限)
                this.editingRole.permissions = this.editingRole.permissions.filter(p => !allPerms.includes(p));
            } else {
                // 未选或部分选 -> 全选 (补齐缺失的权限)
                allPerms.forEach(p => {
                    if (!this.editingRole.permissions.includes(p)) {
                        this.editingRole.permissions.push(p);
                    }
                });
            }
        },

        getPermCount(role) {
            if (!role.permissions) return '0 points';
            if (role.permissions.includes('*')) return 'ALL (Super Admin)';
            return role.permissions.length + ' points';
        }
    },
    computed: {
        canEdit() {
            // 简单模拟：如果传递了 hasPermission 函数则调用，否则默认允许（仅供演示，实际应由 app.js 控制）
            return typeof this.hasPermission === 'function' ? this.hasPermission('SYSTEM:RBAC:EDIT') : true;
        }
    },
    template: `
        <div class="space-y-4">
            <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-gray-800">角色与权限配置</h3>
                    <button v-if="canEdit" @click="initCreate" class="bg-opay text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-opay-hover transition">
                        + 新建角色
                    </button>
                </div>
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role Name</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Code</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Permissions</th>
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
                                <button @click="editRole(r)" class="text-opay text-xs font-bold hover:underline">
                                    {{ canEdit ? '配置权限' : '查看权限' }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Permission Config Modal -->
            <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
                <div class="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl shadow-xl flex flex-col overflow-hidden">
                    <!-- Header -->
                    <div class="px-6 py-4 border-b shrink-0 bg-gray-50 flex justify-between items-center">
                        <h3 class="text-lg font-bold text-gray-800">{{ mode === 'create' ? '新建角色' : (canEdit ? '配置权限' : '查看权限') }}</h3>
                        <div class="text-xs text-gray-500">
                            角色: <span class="font-bold text-opay">{{ editingRole.name }}</span>
                        </div>
                    </div>
                    
                    <div class="flex-1 overflow-y-auto p-6 bg-white">
                        <!-- Role Basic Info -->
                        <div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded border border-gray-100">
                            <div class="form-group">
                                <label class="label-std">角色名称</label>
                                <input v-model="editingRole.name" type="text" class="input-std" :disabled="!canEdit">
                            </div>
                            <div class="form-group">
                                <label class="label-std">角色代码 (Code)</label>
                                <input v-model="editingRole.code" type="text" :disabled="mode === 'edit' || !canEdit" class="input-std" :class="(mode === 'edit' || !canEdit) ? 'bg-gray-100 text-gray-400' : ''">
                            </div>
                        </div>

                        <!-- Permission Tree -->
                        <div class="space-y-1">
                            <div class="flex items-center justify-between px-1 mb-2">
                                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider">功能权限列表</h4>
                                <span class="text-[10px] text-gray-400">已选: {{ editingRole.permissions.length }} 项</span>
                            </div>

                            <!-- Modules Loop -->
                            <div v-for="mod in permTree" :key="mod.code" class="border border-gray-200 rounded-lg overflow-hidden mb-3">
                                <!-- Module Header -->
                                <div class="px-3 py-2.5 bg-gray-50 flex items-center gap-3 select-none hover:bg-gray-100 transition">
                                    <!-- Toggle Expand Icon -->
                                    <div @click="toggleExpand(mod.code)" class="p-1 cursor-pointer text-gray-400 hover:text-gray-600">
                                        <svg class="w-3 h-3 transition-transform duration-200" 
                                             :class="expandedModules.includes(mod.code) ? 'transform rotate-90' : ''"
                                             fill="currentColor" viewBox="0 0 20 20"><path d="M6 6L14 10L6 14V6Z"/></svg>
                                    </div>
                                    
                                    <!-- Module Checkbox (Select All) -->
                                    <div class="flex items-center gap-2 flex-1">
                                        <div class="relative flex items-center cursor-pointer" @click="toggleModuleAll(mod)">
                                            <!-- Checkbox Appearance -->
                                            <div class="w-4 h-4 border rounded transition-colors flex items-center justify-center"
                                                 :class="[
                                                     getModuleCheckState(mod) === 2 ? 'bg-opay border-opay' : (getModuleCheckState(mod) === 1 ? 'bg-opay border-opay' : 'bg-white border-gray-300'),
                                                     !canEdit ? 'opacity-60 cursor-not-allowed' : ''
                                                 ]">
                                                <!-- Checkmark (Full) -->
                                                <svg v-if="getModuleCheckState(mod) === 2" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                                <!-- Indeterminate (Dash) -->
                                                <div v-else-if="getModuleCheckState(mod) === 1" class="w-2.5 h-0.5 bg-white"></div>
                                            </div>
                                        </div>
                                        <span class="text-sm font-bold text-gray-700 cursor-pointer" @click="toggleExpand(mod.code)">{{ mod.name }}</span>
                                    </div>
                                </div>

                                <!-- Module Content (Resources & Actions) -->
                                <div v-show="expandedModules.includes(mod.code)" class="bg-white border-t border-gray-100 p-4 space-y-4">
                                    <div v-for="res in mod.resources" :key="res.code" class="pl-7">
                                        <div class="text-xs font-bold text-gray-500 mb-2">{{ res.name }}</div>
                                        <div class="flex flex-wrap gap-3">
                                            <label v-for="act in res.actions" :key="act.k" 
                                                   class="flex items-center gap-2 p-1.5 pr-3 rounded border transition-all select-none"
                                                   :class="[
                                                       hasPerm(mod.code + ':' + res.code + ':' + act.k) ? 'bg-green-50 border-opay' : 'bg-white border-gray-200',
                                                       canEdit ? 'cursor-pointer hover:border-opay' : 'cursor-not-allowed opacity-80'
                                                   ]">
                                                
                                                <input type="checkbox" 
                                                       :disabled="!canEdit"
                                                       :checked="hasPerm(mod.code + ':' + res.code + ':' + act.k)"
                                                       @change="togglePerm(mod.code + ':' + res.code + ':' + act.k)"
                                                       class="accent-opay w-3.5 h-3.5 rounded cursor-pointer">
                                                
                                                <span class="text-xs font-medium" :class="hasPerm(mod.code + ':' + res.code + ':' + act.k) ? 'text-gray-900' : 'text-gray-500'">
                                                    {{ act.n }}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0 shadow-inner">
                        <button @click="showModal = false" class="px-5 py-2 text-gray-600 font-bold text-sm hover:bg-gray-200 rounded transition">
                            {{ canEdit ? '取消' : '关闭' }}
                        </button>
                        <button v-if="canEdit" @click="save" class="bg-opay text-white px-6 py-2 rounded text-sm font-bold shadow hover:bg-green-600 transition transform active:scale-95">保存配置</button>
                    </div>
                </div>
            </div>
        </div>
    `
};