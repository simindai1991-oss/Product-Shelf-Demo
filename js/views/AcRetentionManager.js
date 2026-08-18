import AcRetentionForm from '../components/AcRetentionForm.js';

export default {
    components: { AcRetentionForm },
    props: ['strategies', 'hasPermission'],
    emits: ['create-strategy', 'update-strategy', 'delete-strategy'],
    data() {
        return {
            showModal: false,
            modalMode: 'create',
            editingStrategy: {},
            filters: {
                keyword: '',
                status: '' // '' for all, 1 for active, 0 for disabled
            }
        }
    },
    computed: {
        filteredStrategies() {
            return this.strategies.filter(s => {
                if (this.filters.keyword) {
                    const kw = this.filters.keyword.toLowerCase();
                    if (!s.name.toLowerCase().includes(kw) && !s.id.toLowerCase().includes(kw)) return false;
                }
                if (this.filters.status !== '') {
                    if (s.status !== Number(this.filters.status)) return false;
                }
                return true;
            }).sort((a, b) => b.priority - a.priority);
        }
    },
    methods: {
        initCreate() {
            this.modalMode = 'create';
            this.editingStrategy = {
                id: 'STR-AUTO-' + Date.now(),
                name: '', priority: 0, status: 1, popupType: 'custom', 
                operator: 'CurrentUser', updateTime: new Date().toISOString().split('T')[0],
                target_audience_id: '',
                script: '', show: true, 
                protocolText: 'I have read and agree to the Terms', urlTermsConditions: '', urlPrivacyPolicy: '',
                icon: '', title: '', brief: '', image: '', buttonLeftTxt: 'Not Now', buttonRightTxt: 'Confirm', buttonUrl: ''
            };
            this.showModal = true;
        },
        openEdit(s) {
            this.modalMode = 'edit';
            this.editingStrategy = JSON.parse(JSON.stringify(s));
            this.showModal = true;
        },
        toggleStatus(s) {
            const copy = JSON.parse(JSON.stringify(s));
            copy.status = copy.status === 1 ? 0 : 1;
            this.$emit('update-strategy', copy);
        },
        handleDelete(s) {
            if (confirm(`确定要删除策略 "${s.name}" 吗？此操作不可恢复。`)) {
                this.$emit('delete-strategy', s);
            }
        },
        handleSave() {
            if (this.modalMode === 'create') {
                this.$emit('create-strategy', this.editingStrategy);
            } else {
                this.editingStrategy.updateTime = new Date().toISOString().split('T')[0];
                this.$emit('update-strategy', this.editingStrategy);
            }
            this.showModal = false;
        }
    },
    template: `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-xl font-bold text-gray-800">AC转账挽留策略管理</h2>
                </div>
                <button v-if="hasPermission('TARGET_OPS:AC_RETENTION:CREATE')" @click="initCreate" class="bg-opay hover:bg-opay-hover text-white px-4 py-2 rounded shadow font-bold flex items-center gap-1 transition">
                    <span class="text-lg">+</span> 新建策略
                </button>
            </div>

            <!-- Filters -->
            <div class="flex justify-between items-center mb-4">
                <div class="relative w-72">
                    <input type="text" v-model="filters.keyword" placeholder="搜索策略名称或ID..." class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-opay outline-none">
                </div>
                <div class="flex gap-2">
                    <button @click="filters.status = ''" :class="filters.status === '' ? 'bg-gray-800 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'" class="px-3 py-1.5 text-xs rounded font-bold transition">全部策略</button>
                    <button @click="filters.status = '1'" :class="filters.status === '1' ? 'bg-gray-800 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'" class="px-3 py-1.5 text-xs rounded font-bold transition">运行中</button>
                    <button @click="filters.status = '0'" :class="filters.status === '0' ? 'bg-gray-800 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'" class="px-3 py-1.5 text-xs rounded font-bold transition">已停用</button>
                </div>
            </div>

            <!-- Table -->
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table class="min-w-full divide-y divide-gray-200 text-left">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-xs font-bold text-gray-500 uppercase w-20">优先级</th>
                            <th class="px-6 py-3 text-xs font-bold text-gray-500 uppercase">策略名称 / ID</th>
                            <th class="px-6 py-3 text-xs font-bold text-gray-500 uppercase">状态</th>
                            <th class="px-6 py-3 text-xs font-bold text-gray-500 uppercase">弹窗类型</th>
                            <th class="px-6 py-3 text-xs font-bold text-gray-500 uppercase">最后修改人</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">操作</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
                        <tr v-for="s in filteredStrategies" :key="s.id" class="hover:bg-gray-50 transition">
                            <td class="px-6 py-4">
                                <span class="font-mono font-bold px-2 py-1 rounded" :class="s.status === 1 ? 'text-opay bg-opay-light' : 'text-gray-500 bg-gray-100'">{{ s.priority }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-bold text-gray-800">{{ s.name }}</div>
                                <div class="text-xs text-gray-400 mt-0.5 font-mono">{{ s.id }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <span v-if="s.status === 1" class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-bold">运行中</span>
                                <span v-else class="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded font-bold">已停用</span>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs border border-indigo-100 rounded font-mono">{{ s.popupType }}</span>
                            </td>
                            <td class="px-6 py-4 text-gray-500">
                                <div>{{ s.operator }}</div>
                                <div class="text-xs text-gray-400">{{ s.updateTime }}</div>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <button v-if="hasPermission('TARGET_OPS:AC_RETENTION:EDIT')" @click="openEdit(s)" class="text-opay hover:text-green-700 font-bold px-2">编辑</button>
                                <button v-if="hasPermission('TARGET_OPS:AC_RETENTION:EDIT')" @click="toggleStatus(s)" :class="s.status === 1 ? 'text-red-500 hover:text-red-700' : 'text-opay hover:text-green-700'" class="font-bold px-2">
                                    {{ s.status === 1 ? '停用' : '启用' }}
                                </button>
                                <button v-if="hasPermission('TARGET_OPS:AC_RETENTION:EDIT') && s.status === 0" @click="handleDelete(s)" class="text-gray-400 hover:text-red-600 font-bold px-2">
                                    删除
                                </button>
                            </td>
                        </tr>
                        <tr v-if="filteredStrategies.length === 0">
                            <td colspan="6" class="text-center py-10 text-gray-400">没有找到匹配的策略记录</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <AcRetentionForm v-if="showModal" v-model="editingStrategy" :mode="modalMode" @close="showModal = false" @save="handleSave" />
        </div>
    `
};