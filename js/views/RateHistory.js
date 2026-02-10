export default {
    props: ['history'],
    template: `
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50"><h3 class="text-lg font-bold text-gray-800">History Log</h3></div>
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-white"><tr><th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th><th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Product</th><th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Details</th><th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Operator</th></tr></thead>
                <tbody class="divide-y divide-gray-200"><tr v-for="h in history" :key="h.id"><td class="px-6 py-4 text-xs font-mono text-gray-600">{{ h.date }}</td><td class="px-6 py-4 text-sm font-bold text-gray-800">{{ h.product_name }}</td><td class="px-6 py-4 text-xs text-opay">{{ h.rate_info }}</td><td class="px-6 py-4 text-xs text-gray-500">{{ h.operator }}</td></tr></tbody>
            </table>
        </div>
    `
};