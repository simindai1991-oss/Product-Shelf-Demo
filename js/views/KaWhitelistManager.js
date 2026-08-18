import KaWhitelistForm from '../components/KaWhitelistForm.js';

export default {
    components: { KaWhitelistForm },
    props: ['whitelists', 'hasPermission'],
    emits: ['create-whitelist', 'update-whitelist', 'delete-whitelist'],
    data() {
        return {
            showModal: false,
            modalMode: 'create',
            editingWhitelist: {},
            filters: {
                keyword: ''
            }
        }
    },
    computed: {
        filteredWhitelists() {
            return this.whitelists.filter(w => {
                if (this.filters.keyword) {
                    const kw = this.filters.keyword.toLowerCase();
                    if (!w.name.toLowerCase().includes(kw) && !w.id.toString().includes(kw)) return false;
                }
                return true;
            }).sort((a, b) => b.id - a.id); // 降序排列
        }
    },
    methods: {
        initCreate() {
            // 根据当前有的 ID 获取最大值，并实现数值自增
            const nextId = this.whitelists.length > 0 ? Math.max(...this.whitelists.map(w => w.id)) + 1 : 1001;
            
            this.modalMode = 'create';
            this.editingWhitelist = {
                id: nextId,
                name: 'Whitelist ' + nextId,
                count: 0,
                updateTime: new Date().toISOString().split('T')[0],
                users: []
            };
            this.showModal = true;
        },
        openEdit(w) {
            this.modalMode = 'edit';
            this.editingWhitelist = JSON.parse(JSON.stringify(w));
            this.showModal = true;
        },
        handleDelete(w) {
            if (confirm(`确定要删除白名单 "${w.name}" 吗？该操作不可恢复。`)) {
                this.$emit('delete-whitelist', w);
            }
        },
        handleSave() {
            this.editingWhitelist.updateTime = new Date().toISOString().split('T')[0];
            if (this.modalMode === 'create') {
                this.$emit('create-whitelist', this.editingWhitelist);
            } else {
                this.$emit('update-whitelist', this.editingWhitelist);
            }
            this.showModal = false;
        }
    },
    template: `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-xl font-bold text-gray-800">KA Fixed 白名单人群</h2>
                    <!-- 去掉了副标题 -->
                </div>
                <button v-if="hasPermission('TARGET_OPS:KA_WHITELIST:CREATE')" @click="initCreate" class="bg-opay hover:bg-opay-hover text-white px-4 py-2 rounded shadow font-bold flex items-center gap-1 transition">
                    <span class="text-lg">+</span> 新建白名单
                </button>
            </div>

            <!-- Filters -->
            <div class="flex justify-between items-center mb-4">
                <div class="relative w-72">
                    <input type="text" v-model="filters.keyword" placeholder="搜索白名单名称或ID..." class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-opay outline-none transition">
                </div>
            </div>

            <!-- Table -->
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table class="min-w-full divide-y divide-gray-200 text-left">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-xs font-bold text-gray-500 uppercase w-32">名单 ID</th>
                            <th class="px-6 py-3 text-xs font-bold text-gray-500 uppercase">白名单名称</th>
                            <th class="px-6 py-3 text-xs font-bold text-gray-500 uppercase">包含用户数</th>
                            <th class="px-6 py-3 text-xs font-bold text-gray-500 uppercase">最后更新时间</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">操作</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
                        <tr v-for="w in filteredWhitelists" :key="w.id" class="hover:bg-gray-50 transition">
                            <td class="px-6 py-4">
                                <span class="font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">{{ w.id }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-bold text-gray-800">{{ w.name }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 bg-blue-50 text-blue-600 text-xs border border-blue-100 rounded font-bold">{{ w.count }} 人</span>
                            </td>
                            <td class="px-6 py-4 text-gray-500 text-xs font-mono">
                                {{ w.updateTime }}
                            </td>
                            <td class="px-6 py-4 text-right">
                                <button v-if="hasPermission('TARGET_OPS:KA_WHITELIST:EDIT')" @click="openEdit(w)" class="text-opay hover:text-green-700 font-bold px-2">编辑名单</button>
                                <button v-if="hasPermission('TARGET_OPS:KA_WHITELIST:EDIT')" @click="handleDelete(w)" class="text-gray-400 hover:text-red-600 font-bold px-2">删除</button>
                            </td>
                        </tr>
                        <tr v-if="filteredWhitelists.length === 0">
                            <td colspan="5" class="text-center py-10 text-gray-400">没有找到匹配的白名单数据</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <KaWhitelistForm v-if="showModal" v-model="editingWhitelist" :mode="modalMode" @close="showModal = false" @save="handleSave" />
        </div>
    `
};