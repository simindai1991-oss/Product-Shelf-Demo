import { statusBadgeClass } from '../utils.js';

export default {
    props: ['productDefinitions', 'categories', 'roleCode', 'hasPermission'],
    emits: ['open-modal'],
    data() {
        return {}
    },
    computed: {
        filteredProducts() {
            if (!this.productDefinitions) return [];
            return this.productDefinitions;
        }
    },
    methods: {
        statusBadgeClass,
        viewProductDef(p) { 
            this.$emit('open-modal', 'view_product_def', p); 
        }
    },
    template: `
        <div class="space-y-4">
            <!-- Header on Floor -->
            <div class="flex justify-between items-center px-1">
                <h2 class="font-bold text-gray-800 text-xl">理财产品管理</h2>
            </div>

            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">产品名称</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">操作</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                        <tr v-for="p in filteredProducts" :key="p.product_code" class="hover:bg-gray-50 transition">
                            <td class="px-6 py-4">
                                <div class="font-bold text-gray-900 text-sm">{{ p.name }}</div>
                                <div class="text-xs text-gray-500 font-mono">{{ p.product_code }}</div>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <button @click="viewProductDef(p)" class="text-gray-500 hover:text-gray-900 font-bold text-xs border border-transparent hover:border-gray-300 px-2 py-1 rounded transition">
                                    查看详情
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `
};