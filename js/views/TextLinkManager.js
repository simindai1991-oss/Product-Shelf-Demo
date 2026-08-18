import TextLinkForm from '../components/TextLinkForm.js';

export default {
    components: { TextLinkForm },
    props: ['strategies', 'hasPermission'],
    emits: ['create-strategy', 'update-strategy', 'delete-strategy'],
    data() {
        return {
            showModal: false,
            modalMode: 'create',
            editingStrategy: {},
            filters: {
                keyword: '',
                status: '' // '' 全部, 1 启用, 0 停用
            }
        }
    },
    computed: {
        filteredStrategies() {
            return this.strategies.filter(s => {
                if (this.filters.keyword) {
                    const kw = this.filters.keyword.toLowerCase();
                    if (!s.name.toLowerCase().includes(kw) && 
                        !s.strategy_id.toLowerCase().includes(kw) && 
                        !s.crowd_rule.toLowerCase().includes(kw)) {
                        return false;
                    }
                }
                if (this.filters.status !== '') {
                    if (s.status !== Number(this.filters.status)) return false;
                }
                return true;
            }).sort((a, b) => b.weight - a.weight); // 按 weight 降序排列
        }
    },
    methods: {
        initCreate() {
            const nextId = 'STR-' + String(Date.now()).slice(-6);
            this.modalMode = 'create';
            this.editingStrategy = {
                strategy_id: nextId,
                name: '新引导策略',
                crowd_rule: '',
                display_text: '',
                link_url: '',
                weight: 1,
                status: 1,
                start_time: '',
                end_time: ''
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
            if (confirm(`确定要删除策略 "${s.name}" 吗？该操作不可恢复。`)) {
                this.$emit('delete-strategy', s);
            }
        },
        handleSave() {
            if (this.modalMode === 'create') {
                this.$emit('create-strategy', this.editingStrategy);
            } else {
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
                    <h2 class="text-xl font-bold text-gray-800">资产页引导文案配置</h2>
                    <p class="text-xs text-gray-500 mt-1">管理 Me Tab Total Balance 下方的文字链展示及人群策略</p>
                </div>
                <button v-if="hasPermission('TARGET_OPS:TEXT_LINK:CREATE')" @click="initCreate" class="bg-opay hover:bg-opay-hover text-white px-4 py-2 rounded shadow font-bold flex items-center gap-1 transition">
                    <span class="text-lg">+</span> 新建配置
                </button>
            </div>

            <!-- Filters -->
            <div class="flex justify-between items-center mb-4">
                <div class="relative w-80">
                    <input type="text" v-model="filters.keyword" placeholder="搜索名称、人群标签或 ID..." class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-opay outline-none transition">
                </div>
                <div class="flex gap-2">
                    <button @click="filters.status = ''" :class="filters.status === '' ? 'bg-gray-800 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'" class="px-3 py-1.5 text-xs rounded font-bold transition">全部状态</button>
                    <button @click="filters.status = '1'" :class="filters.status === '1' ? 'bg-gray-800 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'" class="px-3 py-1.5 text-xs rounded font-bold transition">启用中</button>
                    <button @click="filters.status = '0'" :class="filters.status === '0' ? 'bg-gray-800 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'" class="px-3 py-1.5 text-xs rounded font-bold transition">已停用</button>
                </div>
            </div>

            <!-- Table -->
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table class="min-w-full divide-y divide-gray-200 text-left">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-xs font-bold text-gray-500 uppercase w-20">优先级</th>
                            <th class="px-6 py-3 text-xs font-bold text-gray-500 uppercase w-48">策略信息</th>
                            <th class="px-6 py-3 text-xs font-bold text-gray-500 uppercase w-40">人群标签</th>
                            <th class="px-6 py-3 text-xs font-bold text-gray-500 uppercase">状态</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase w-40">操作</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
                        <tr v-for="s in filteredStrategies" :key="s.strategy_id" class="hover:bg-gray-50 transition">
                            <td class="px-6 py-4">
                                <span class="font-mono font-bold px-2 py-1 rounded" :class="s.status === 1 ? 'text-opay bg-opay-light' : 'text-gray-500 bg-gray-100'">{{ s.weight }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-bold text-gray-800">{{ s.name }}</div>
                                <div class="text-[10px] text-gray-400 mt-1 font-mono">{{ s.strategy_id }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs border border-blue-100 rounded font-bold">{{ s.crowd_rule }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <span v-if="s.status === 1" class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-bold whitespace-nowrap border border-green-200">启用中</span>
                                    <span v-else class="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded font-bold whitespace-nowrap">已停用</span>
                                </div>
                                <div v-if="s.start_time || s.end_time" class="text-[10px] text-gray-400 mt-2 font-mono flex items-center gap-1">
                                    <i class="ph ph-clock"></i> {{ s.start_time ? s.start_time.replace('T', ' ') : 'Now' }} - {{ s.end_time ? s.end_time.replace('T', ' ') : 'Forever' }}
                                </div>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex justify-end gap-2">
                                    <button v-if="hasPermission('TARGET_OPS:TEXT_LINK:EDIT')" @click="openEdit(s)" class="text-opay hover:text-green-700 font-bold px-2">编辑</button>
                                    <button v-if="hasPermission('TARGET_OPS:TEXT_LINK:EDIT')" @click="toggleStatus(s)" :class="s.status === 1 ? 'text-red-500 hover:text-red-700' : 'text-opay hover:text-green-700'" class="font-bold px-2">
                                        {{ s.status === 1 ? '停用' : '启用' }}
                                    </button>
                                    <button v-if="hasPermission('TARGET_OPS:TEXT_LINK:EDIT') && s.status === 0" @click="handleDelete(s)" class="text-gray-400 hover:text-red-600 font-bold pl-2 border-l">
                                        删除
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="filteredStrategies.length === 0">
                            <td colspan="5" class="text-center py-12 text-gray-400">没有找到匹配的策略配置</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <TextLinkForm v-if="showModal" v-model="editingStrategy" :mode="modalMode" @close="showModal = false" @save="handleSave" />
        </div>
    `
};