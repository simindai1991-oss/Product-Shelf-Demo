import Modal from './Modal.js';

export default {
    components: { Modal },
    props: ['modelValue', 'mode', 'formType', 'categories'], 
    emits: ['update:modelValue', 'close', 'save'],
    computed: {
        editingData: {
            get() { return this.modelValue; },
            set(val) { this.$emit('update:modelValue', val); }
        },
        modalTitle() {
            if (this.mode === 'view') return '查看详情 (Read Only)';
            if (this.formType === 'product_def') return '编辑产品属性';
            return '修改单品要素';
        },
        isRateTiered() {
            return this.editingData.interest_rate?.type === 'tiered';
        },
        // 控制基础信息是否可编辑
        isBasicInfoEditable() {
            if (this.mode === 'view') return false;
            // 标准单品修改模式下，基础信息不允许改
            if (this.formType === 'item' && this.mode === 'edit') return false;
            return true;
        },
        // 控制利率是否可编辑
        isRateEditable() {
            if (this.mode === 'view') return false;
            return true;
        }
    },
    methods: {
        setRateType(type) {
            if (!this.isRateEditable) return;
            if (!this.editingData.interest_rate) this.editingData.interest_rate = {};
            this.editingData.interest_rate.type = type;
            if (type === 'flat') {
                this.editingData.interest_rate.value = 0;
                delete this.editingData.interest_rate.rules;
            } else {
                this.editingData.interest_rate.rules = [{ rate: 0, min: 0 }];
                delete this.editingData.interest_rate.value;
            }
        },
        addRateRule() {
            if (!this.isRateEditable) return;
            this.editingData.interest_rate.rules.push({ rate: 0, min: 0 });
        },
        removeRateRule(idx) {
            if (!this.isRateEditable) return;
            this.editingData.interest_rate.rules.splice(idx, 1);
        }
    },
    template: `
        <Modal :title="modalTitle" @close="$emit('close')">
            <div class="flex-1 overflow-y-auto p-6 bg-gray-50">
                <!-- FORM TYPE: PRODUCT DEF (L1) -->
                <div v-if="formType === 'product_def'" class="space-y-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="label-std">Product Code</label>
                            <input v-model="editingData.product_code" disabled class="input-std font-mono bg-gray-100">
                        </div>
                        <div class="form-group">
                            <label class="label-std">Category</label>
                            <select v-model="editingData.category" disabled class="input-std bg-gray-100">
                                <option v-for="c in categories" :value="c.code">{{ c.name }}</option>
                            </select>
                        </div>
                        <div class="form-group col-span-2">
                            <label class="label-std">Product Name</label>
                            <input v-model="editingData.name" disabled class="input-std bg-gray-100">
                        </div>
                    </div>
                    <div class="border-t border-gray-200 pt-4">
                        <h4 class="text-sm font-bold text-gray-800 mb-3">Compliance & Finance</h4>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="form-group">
                                <label class="label-std">Fund Merchant No.</label>
                                <input v-model="editingData.fund_merchant_no" disabled class="input-std font-mono bg-gray-100">
                            </div>
                            <div class="form-group">
                                <label class="label-std">Protocol URL</label>
                                <input v-model="editingData.product_protocol" disabled class="input-std text-blue-600 bg-gray-100">
                            </div>
                            <div class="form-group">
                                <label class="label-std">Tax Rate</label>
                                <input type="number" v-model="editingData.tax_rate" disabled class="input-std bg-gray-100">
                            </div>
                            <div class="form-group">
                                <label class="label-std">Tax Bearer</label>
                                <input v-model="editingData.tax_bearer" disabled class="input-std bg-gray-100">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- FORM TYPE: SAVING ITEM (L2) -->
                <div v-if="formType === 'item'" class="space-y-6">
                    <div class="bg-yellow-50 border border-yellow-200 p-3 rounded text-xs text-yellow-800 mb-4" v-if="mode === 'edit'">
                        Standard Item 修改模式：仅允许调整利率配置，基础信息不可变更。
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="label-std">Item Name</label>
                            <input v-model="editingData.item_name" :disabled="!isBasicInfoEditable" class="input-std" :class="!isBasicInfoEditable ? 'bg-gray-100' : ''">
                        </div>
                        <div class="form-group">
                            <label class="label-std">Item Code</label>
                            <input v-model="editingData.item_code" disabled class="input-std bg-gray-100 font-mono">
                        </div>
                    </div>
                    
                    <div class="border-t border-gray-200 pt-4">
                        <div class="flex justify-between items-center mb-3">
                            <h4 class="text-sm font-bold text-gray-800">Interest Rate Config</h4>
                            <div class="flex bg-gray-200 rounded p-1" v-if="isRateEditable">
                                <button @click="setRateType('flat')" :class="!isRateTiered ? 'bg-white shadow' : 'text-gray-500'" class="px-3 py-1 text-xs rounded transition">Flat</button>
                                <button @click="setRateType('tiered')" :class="isRateTiered ? 'bg-white shadow' : 'text-gray-500'" class="px-3 py-1 text-xs rounded transition">Tiered</button>
                            </div>
                        </div>
                        
                        <div v-if="!isRateTiered" class="bg-white p-4 border rounded">
                            <label class="label-std">Annual Rate (Decimal)</label>
                            <input type="number" step="0.01" v-model="editingData.interest_rate.value" :disabled="!isRateEditable" class="input-std font-mono text-opay font-bold" :class="!isRateEditable ? 'bg-gray-50' : ''">
                        </div>
                        
                        <div v-else class="space-y-2">
                            <div v-for="(rule, idx) in editingData.interest_rate.rules" :key="idx" class="flex gap-2 items-end">
                                <div class="flex-1">
                                    <label class="label-std">Min Amount</label>
                                    <input type="number" v-model="rule.min" :disabled="!isRateEditable" class="input-std" :class="!isRateEditable ? 'bg-gray-50' : ''">
                                </div>
                                <div class="flex-1">
                                    <label class="label-std">Rate (Decimal)</label>
                                    <input type="number" step="0.01" v-model="rule.rate" :disabled="!isRateEditable" class="input-std font-mono text-opay" :class="!isRateEditable ? 'bg-gray-50' : ''">
                                </div>
                                <button v-if="isRateEditable" @click="removeRateRule(idx)" class="mb-2 text-red-500 hover:bg-red-50 p-1 rounded">🗑️</button>
                            </div>
                            <button v-if="isRateEditable" @click="addRateRule" class="text-xs text-opay font-bold">+ Add Tier</button>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <button @click="$emit('close')" class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded text-sm font-bold">Close</button>
                <button v-if="mode === 'edit'" @click="$emit('save')" class="px-5 py-2 bg-opay hover:bg-opay-hover text-white rounded shadow text-sm font-bold">Submit Changes</button>
            </template>
        </Modal>
    `
};