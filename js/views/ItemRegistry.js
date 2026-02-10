import { formatRateDisplay, statusBadgeClass } from '../utils.js';

export default {
    props: ['savingItems', 'productDefinitions', 'hasPermission'],
    emits: ['open-modal', 'mock-pass-item'],
    data() {
        return {
            filters: { parentCode: '' }
        }
    },
    computed: {
        parentOptions() {
            if (!this.productDefinitions) return [];
            return this.productDefinitions.map(p => ({ code: p.product_code, name: p.name }));
        },
        flatItems() {
            if (!this.savingItems) return [];
            const standardFixedCodes = ['Fixed_100401', 'Fixed_100402'];
            
            return this.savingItems
                .filter(item => {
                    let isStandard = true;
                    if (item.product_code === 'Fixed') {
                        isStandard = standardFixedCodes.includes(item.item_code);
                    }
                    if (!isStandard) return false;

                    if (this.filters.parentCode && item.product_code !== this.filters.parentCode) {
                        return false;
                    }
                    return true;
                })
                .map(item => {
                    const parent = this.productDefinitions.find(p => p.product_code === item.product_code);
                    return {
                        ...item,
                        parentName: parent ? parent.name : item.product_code,
                        category: parent ? parent.category : '-',
                        isPending: !!item.pending_rate_config
                    };
                });
        }
    },
    methods: {
        formatRateDisplay,
        statusBadgeClass,
        editItem(item) { this.$emit('open-modal', 'edit_item', item); },
        viewItem(item) { this.$emit('open-modal', 'view_item', item); },
        mockPass(item) { this.$emit('mock-pass-item', item); }
    },
    template: `
        <div class="space-y-4">
            <div class="flex justify-between items-center px-1">
                <h2 class="font-bold text-gray-800 text-xl">标准单品管理</h2>
                <div>
                    <select v-model="filters.parentCode" class="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 outline-none bg-white focus:ring-1 focus:ring-opay transition">
                        <option value="">全部产品</option>
                        <option v-for="p in parentOptions" :value="p.code">{{ p.name }}</option>
                    </select>
                </div>
            </div>

            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Item Name</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Parent Product</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Rate Config (Current)</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                        <tr v-for="item in flatItems" :key="item.item_code" class="hover:bg-gray-50 transition">
                            <td class="px-6 py-4">
                                <div class="font-bold text-gray-900 text-sm">{{ item.item_name }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm text-gray-700">{{ item.parentName }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex flex-col gap-1 items-start">
                                    <div class="text-xs font-mono font-bold text-opay bg-green-50 px-2 py-1 rounded inline-block">
                                        {{ formatRateDisplay(item.interest_rate) }}
                                    </div>
                                    <div v-if="item.isPending" class="flex items-center gap-2 animate-pulse">
                                        <span class="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded border border-yellow-200 font-bold">
                                            修改审核中
                                        </span>
                                        <button @click="mockPass(item)" class="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded hover:bg-blue-700 shadow-sm" title="Mock Pass">
                                            通过
                                        </button>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-right space-x-2">
                                <button @click="viewItem(item)" class="text-gray-500 hover:text-gray-900 font-bold text-xs">
                                    查询
                                </button>
                                <button v-if="hasPermission('edit') && !item.isPending" @click="editItem(item)" class="text-blue-600 hover:text-blue-800 font-bold text-xs border border-transparent hover:border-blue-200 px-2 py-1 rounded transition">
                                    修改
                                </button>
                                <span v-if="item.isPending" class="text-gray-400 text-xs italic">锁定中</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `
};