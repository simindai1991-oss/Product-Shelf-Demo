export default {
    props: ['params', 'hasPermission'],
    emits: ['update-param', 'add-param'],
    data() { return { editingParam: null, showAddModal: false, newParam: { key: '', value: '', desc: '' } } },
    methods: {
        startEdit(p) { this.editingParam = p.key; p.tempValue = p.value; },
        save(p) { this.$emit('update-param', p.key, p.tempValue); this.editingParam = null; },
        confirmAdd() { if(this.newParam.key) { this.$emit('add-param', {...this.newParam}); this.showAddModal = false; } }
    },
    template: `
        <div class="space-y-4">
            <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-gray-800">系统参数</h3>
                    <button v-if="hasPermission('edit')" @click="showAddModal=true" class="bg-opay text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-opay-hover transition">
                        + 新增参数
                    </button>
                </div>
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Key</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Value</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Description</th>
                            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase w-24">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <tr v-for="p in params" :key="p.key">
                            <td class="px-6 py-4 font-mono text-xs">{{ p.key }}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <input v-if="editingParam === p.key" v-model="p.tempValue" class="border border-opay rounded px-2 py-1 w-full max-w-xs text-sm outline-none bg-green-50">
                                    <span v-else>{{ p.value }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500">{{ p.desc }}</td>
                            <td class="px-6 py-4 text-right">
                                <button v-if="editingParam !== p.key && hasPermission('edit')" 
                                        @click="startEdit(p)" 
                                        class="text-opay hover:text-green-700 font-bold text-xs">
                                        编辑
                                </button>
                                <div v-if="editingParam === p.key" class="flex gap-2 justify-end">
                                    <button @click="save(p)" class="text-white bg-opay px-2 py-1 rounded text-xs font-bold hover:bg-opay-hover">保存</button>
                                    <button @click="editingParam=null" class="text-gray-500 text-xs">取消</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
                <div class="bg-white p-6 rounded-xl shadow-lg w-96 space-y-4">
                    <h3 class="font-bold text-gray-800">New Param</h3>
                    <input v-model="newParam.key" placeholder="Key" class="border w-full p-2 rounded input-std uppercase">
                    <input v-model="newParam.value" placeholder="Value" class="border w-full p-2 rounded input-std">
                    <input v-model="newParam.desc" placeholder="Desc" class="border w-full p-2 rounded input-std">
                    <div class="flex justify-end gap-2">
                        <button @click="showAddModal=false" class="text-gray-500 text-sm font-bold">取消</button>
                        <button @click="confirmAdd" class="bg-opay text-white px-4 py-2 rounded text-sm font-bold shadow hover:bg-opay-hover">保存</button>
                    </div>
                </div>
            </div>
        </div>
    `
};