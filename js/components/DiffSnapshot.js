import { FIELD_NAMES, formatMoney } from '../utils.js';

export default {
    props: ['originalSnapshot', 'editingProduct', 'targetStatus', 'actionType'],
    emits: ['close', 'confirm'],
    data() {
        return {
            approvalNote: '',
            uploadedFileName: ''
        }
    },
    computed: {
        diffMap() {
            const map = {};
            const keys = new Set([...Object.keys(this.originalSnapshot), ...Object.keys(this.editingProduct)]);
            
            // 针对所有情况忽略的公共字段，新增 plan_id
            let ignoredKeys = ['displayRate', 'update_time', 'operator', 'sold_amount', 'displayStatus', 'auditStatusLabel', 'progress', 'plan_id'];
            
            // 单品管理 (modify_item) 专属忽略字段
            if (this.actionType === 'modify_item') {
                ignoredKeys = ignoredKeys.concat(['parentName', 'category', 'isPending']);
            }
            
            keys.forEach(key => {
                if (ignoredKeys.includes(key)) return;
                let oldVal = this.originalSnapshot[key];
                let newVal = this.editingProduct[key];
                if (key === 'rates') { oldVal = JSON.stringify(oldVal); newVal = JSON.stringify(newVal); }
                if (oldVal != newVal) map[key] = true;
            });
            return map;
        },
        // 判断是否为 Fixed Special 相关操作 (只有 Fixed Special 才有成本预算和文件上传)
        isFixedSpecial() {
            return ['issue_fixed', 'modify_fixed', 'apply_listing', 'off_shelf'].includes(this.actionType);
        },
        estimatedCost() {
            if (!this.isFixedSpecial) return 0;
            if (this.actionType === 'off_shelf') return 0;
            if (this.actionType === 'issue_fixed' || this.actionType === 'apply_listing') return 500;
            if (this.actionType === 'modify_fixed') {
                const oldRate = this.originalSnapshot.rates?.[0]?.rate || 0;
                const newRate = this.editingProduct.rates?.[0]?.rate || 0;
                return newRate > oldRate ? 500 : 0;
            }
            return 0;
        },
        // 判断是否可以提交审批
        canSubmit() {
            // 申请说明必须填写（去掉空格后不为空）
            return this.approvalNote.trim().length > 0;
        }
    },
    methods: {
        formatMoney,
        getFieldName(key) { return FIELD_NAMES[key] || key; },
        formatDiffValue(key, val) { 
            if (key === 'rates' && Array.isArray(val)) {
                return val.map(r => `≥ ${r.stepMinAmount} : ${(r.rate*100).toFixed(2)}%`).join('\n');
            }
            return typeof val === 'object' ? JSON.stringify(val) : val; 
        },
        handleFileUpload(e) {
            const file = e.target.files[0];
            if (file) {
                this.uploadedFileName = file.name;
            }
        },
        downloadTemplate() {
            const headers = "配置项 (Parameter),输入内容 (Value),填写说明 (Instructions)\n一、产品发行目标 (Target),,\n二、基础信息 (Basic Info),,\n产品名称 *,,需与审批流表单名称一致\n产品别名,,客户端显示名称\n三、金额限制 (Amount Limits - 货币: 奈拉),,\n单笔最小申购 *,,格式：数值，保留2位小数\n累计申购限额 *,,单客户累计申购上限\n计划发行规模 *,,产品总发售规模\n四、期限周期 (Duration & Period),,\n产品申购起始日 *,,格式：YYYY-MM-DD\n产品申购截止日 *,,格式：YYYY-MM-DD\n产品固定期限 (天) *,,仅填整数\n五、利率与客群 (Interest & Group),,\n适用利率 (年化) *,,格式：百分比，保留2位小数\n对照利率 (Benchmark) *,,参考：7-60天 15%...\n定向发售客群ID (生产) *,2350,请使用manager平台所定义的人群\n";
            const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", "Fixed_Special_产品要素表模板.csv");
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    },
    template: `
        <div class="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div class="bg-white w-full h-full max-w-7xl rounded-xl shadow-2xl flex flex-col overflow-hidden m-4">
                <!-- Header -->
                <div class="px-6 py-4 bg-gray-800 text-white flex justify-between items-center shrink-0">
                    <h3 class="text-lg font-bold">审批详情 (Approval Request)</h3>
                    <span class="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">PENDING SUBMISSION</span>
                </div>
                
                <div class="flex-1 flex overflow-hidden font-mono text-xs">
                    <!-- Left: Before (30% width) -->
                    <div class="w-[30%] bg-gray-50 p-6 overflow-y-auto border-r border-gray-200">
                        <h4 class="font-bold text-gray-500 mb-4 uppercase border-b pb-2">变更前 (Current Snapshot)</h4>
                        <div class="space-y-2">
                            <div class="grid grid-cols-3 gap-2 border-b border-gray-100 pb-1">
                                <span class="text-gray-400 font-bold">Status</span>
                                <span class="col-span-2 text-gray-600">{{ originalSnapshot.status || 'N/A (New)' }}</span>
                            </div>
                            <template v-for="(val, key) in originalSnapshot" :key="key">
                                <!-- 在模板中也过滤掉 isPending, parentName, category, plan_id 以防万一 -->
                                <div v-if="key !== 'status' && !['displayRate', 'update_time', 'operator', 'sold_amount', 'displayStatus', 'auditStatusLabel', 'progress', 'isPending', 'parentName', 'category', 'plan_id'].includes(key)" 
                                     class="grid grid-cols-3 gap-2 border-b border-gray-100 pb-1"
                                     :class="diffMap[key] ? 'bg-yellow-50' : ''">
                                    <span class="text-gray-400 font-bold break-all">{{ getFieldName(key) }}</span>
                                    <span class="col-span-2 whitespace-pre-wrap break-all" :class="diffMap[key] ? 'text-red-600 font-bold' : 'text-gray-600'">{{ formatDiffValue(key, val) }}</span>
                                </div>
                            </template>
                        </div>
                    </div>

                    <!-- Right: After + Cost (70% width) -->
                    <div class="flex-1 bg-white p-6 overflow-y-auto flex flex-col relative">
                        
                        <!-- Cost Badge (Top Right) - Only for Fixed Special -->
                        <div v-if="isFixedSpecial" class="absolute top-6 right-6 flex flex-col items-end z-10 bg-white/90 p-2 rounded border border-gray-100 shadow-sm">
                            <div class="text-[10px] text-gray-400 uppercase font-bold mb-1">预估成本 (Est. Cost)</div>
                            <div class="text-2xl font-mono font-bold text-opay">$ {{ formatMoney(estimatedCost).replace('₦', '') }}</div>
                        </div>

                        <h4 class="font-bold text-opay mb-4 uppercase border-b pb-2">变更后 (Proposed)</h4>
                        
                        <!-- Diff Content -->
                        <div class="space-y-2 flex-1 overflow-y-auto mb-6">
                            <div class="grid grid-cols-3 gap-2 border-b border-gray-100 pb-1" :class="originalSnapshot.status !== targetStatus ? 'bg-yellow-100' : ''">
                                <span class="text-gray-400 font-bold">Target Status</span>
                                <span class="col-span-2 font-bold" :class="originalSnapshot.status !== targetStatus ? 'text-red-600' : 'text-gray-600'">{{ targetStatus }}</span>
                            </div>
                            <template v-for="(val, key) in editingProduct" :key="key">
                                <div v-if="key !== 'status' && !['displayRate', 'update_time', 'operator', 'sold_amount', 'displayStatus', 'auditStatusLabel', 'progress', 'isPending', 'parentName', 'category', 'plan_id'].includes(key)" 
                                     class="grid grid-cols-3 gap-2 border-b border-gray-100 pb-1"
                                     :class="diffMap[key] ? 'bg-yellow-100 -mx-2 px-2 rounded' : ''">
                                    <span class="text-gray-400 font-bold break-all">{{ getFieldName(key) }}</span>
                                    <span class="col-span-2 whitespace-pre-wrap break-all" :class="diffMap[key] ? 'text-red-600 font-bold' : 'text-gray-600'">{{ formatDiffValue(key, val) }}</span>
                                </div>
                            </template>
                        </div>

                        <!-- Application Info Area (Sticky Bottom) -->
                        <div class="pt-4 border-t border-gray-100 space-y-4 bg-gray-50 -mx-6 -mb-6 p-6 shrink-0">
                            
                            <!-- Reason -->
                            <div>
                                <label class="block text-xs font-bold text-gray-500 mb-1">申请说明 (Reason) <span class="text-red-500">*</span></label>
                                <textarea v-model="approvalNote" 
                                          class="w-full border rounded p-2 text-xs h-20 outline-none resize-none transition-colors" 
                                          :class="approvalNote.trim().length === 0 ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-opay'"
                                          placeholder="必填项：请输入本次申请变更/上架的详细说明..."></textarea>
                                <p v-if="approvalNote.trim().length === 0" class="text-red-500 text-[10px] mt-1">请输入申请说明以继续操作</p>
                            </div>

                            <!-- Attachments - Only for Fixed Special -->
                            <div v-if="isFixedSpecial" class="flex items-center justify-between">
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 mb-1">产品要素表 (Fixed Special Table)</label>
                                    <div class="flex items-center gap-2">
                                        <label class="cursor-pointer bg-white border border-gray-300 hover:border-opay text-gray-600 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition shadow-sm">
                                            <span>📂 上传文件</span>
                                            <input type="file" class="hidden" accept=".csv,.xlsx,.xls" @change="handleFileUpload">
                                        </label>
                                        <span v-if="uploadedFileName" class="text-xs text-opay font-bold flex items-center gap-1">
                                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                            {{ uploadedFileName }}
                                        </span>
                                        <span v-else class="text-xs text-gray-400 italic">未上传</span>
                                    </div>
                                </div>
                                <div>
                                    <a href="#" @click.prevent="downloadTemplate" class="text-[10px] text-blue-500 hover:text-blue-700 underline flex items-center gap-1">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                        下载要素表模板
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="p-4 border-t flex justify-end gap-3 shrink-0 bg-gray-50">
                    <button @click="$emit('close')" class="px-4 py-2 text-gray-600 font-bold hover:text-gray-800 transition">返回修改</button>
                    <button @click="$emit('confirm')" 
                            class="px-6 py-2 font-bold rounded shadow flex items-center gap-2 transition" 
                            :disabled="!canSubmit"
                            :class="!canSubmit ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-opay hover:bg-opay-hover text-white'">
                        <span>发起审批</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    `
};