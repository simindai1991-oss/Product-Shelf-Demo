import Modal from './Modal.js';

const PAYMENT_MODE_OPTIONS = [
    { code: 'MONTHLY', label: '月付', priceKey: 'monthlyPrice', priceLabel: '月付价 (₦)' },
    { code: 'QUARTERLY', label: '季付', priceKey: 'quarterlyPrice', priceLabel: '季付价 (₦)' },
    { code: 'BIANNUAL', label: '半年付', priceKey: 'biannualPrice', priceLabel: '半年付价 (₦)' },
    { code: 'ANNUAL', label: '年付', priceKey: 'annualPrice', priceLabel: '年付价 (₦)' }
];

export default {
    components: { Modal },
    props: ['modelValue', 'mode', 'categories', 'companies'],
    emits: ['update:modelValue', 'close', 'save'],
    data() {
        return {
            activeTab: 'basic',
            paymentModeOptions: PAYMENT_MODE_OPTIONS,
            autoRenewLeadEnabled: false
        };
    },
    computed: {
        form: {
            get() { return this.modelValue; },
            set(val) { this.$emit('update:modelValue', val); }
        },
        isReadonly() { return this.mode === 'view'; },
        isCreate() { return this.mode === 'create'; },
        modalTitle() {
            if (this.mode === 'view') return '查看保险产品';
            if (this.mode === 'create') return '新建保险产品';
            return '编辑保险产品参数';
        },
        isHmo() { return this.form.insuranceType === 'HMO'; }
    },
    watch: {
        modelValue: {
            immediate: true,
            handler(val) {
                if (!val) return;
                this.autoRenewLeadEnabled = Number(val.autoRenewLeadDays || 0) > 0;
                if (val.firstMonthFree === undefined) {
                    val.firstMonthFree = !!val.promoLabel;
                }
                if (!val.shelfStatus) {
                    if (val.isActive === true) val.shelfStatus = 'OnShelf';
                    else if (val.isActive === false && val.shelfStatus !== 'Draft') val.shelfStatus = 'OffShelf';
                    else val.shelfStatus = val.shelfStatus || 'Draft';
                }
            }
        }
    },
    methods: {
        toggleMode(mode) {
            if (this.isReadonly) return;
            const list = this.form.supportedPaymentModes || [];
            const idx = list.indexOf(mode);
            if (idx >= 0) list.splice(idx, 1);
            else list.push(mode);
            this.form.supportedPaymentModes = [...list];
        },
        hasMode(mode) {
            return (this.form.supportedPaymentModes || []).includes(mode);
        },
        onAutoRenewLeadToggle() {
            if (!this.autoRenewLeadEnabled) {
                this.form.autoRenewLeadDays = 0;
            } else if (!this.form.autoRenewLeadDays || this.form.autoRenewLeadDays < 1) {
                this.form.autoRenewLeadDays = 1;
            }
        },
        addFaq() {
            if (this.isReadonly) return;
            if (!this.form.faqs) this.form.faqs = [];
            this.form.faqs.push({ q: '', a: '' });
        },
        removeFaq(i) {
            if (this.isReadonly) return;
            this.form.faqs.splice(i, 1);
        },
        addClaimStep() {
            if (this.isReadonly) return;
            if (!this.form.claimSteps) this.form.claimSteps = [];
            this.form.claimSteps.push('');
        },
        removeClaimStep(i) {
            if (this.isReadonly) return;
            this.form.claimSteps.splice(i, 1);
        },
        nextCoverCode() {
            const existing = (this.form.covers || []).map(c => c.coverCode);
            let n = existing.length + 1;
            let code = `COVER_${String(n).padStart(3, '0')}`;
            while (existing.includes(code)) {
                n += 1;
                code = `COVER_${String(n).padStart(3, '0')}`;
            }
            return code;
        },
        addCover() {
            if (this.isReadonly) return;
            if (!this.form.covers) this.form.covers = [];
            const next = (this.form.covers.length || 0) + 1;
            this.form.covers.push({
                coverCode: this.nextCoverCode(),
                coverName: '',
                limitText: '',
                effectiveRuleSubtitle: '',
                detailedDescription: '',
                sortOrder: next
            });
        },
        removeCover(i) {
            if (this.isReadonly) return;
            this.form.covers.splice(i, 1);
        },
        moveCover(i, dir) {
            if (this.isReadonly) return;
            const j = i + dir;
            if (j < 0 || j >= this.form.covers.length) return;
            const arr = this.form.covers;
            const tmp = arr[i];
            arr.splice(i, 1, arr[j]);
            arr.splice(j, 1, tmp);
            arr.forEach((c, idx) => { c.sortOrder = idx + 1; });
        },
        save() {
            if (!this.form.planCode || !this.form.planName) {
                alert('请填写产品编码与产品名称');
                return;
            }
            if (!this.form.underwriterCode) {
                alert('请选择承保方');
                return;
            }
            if (!this.form.insuranceType) {
                alert('请选择保险品类');
                return;
            }
            if (!(this.form.supportedPaymentModes || []).length) {
                alert('请至少选择一个缴费周期');
                return;
            }
            if (!this.autoRenewLeadEnabled) this.form.autoRenewLeadDays = 0;
            if (!this.form.gracePeriodEnabled) this.form.gracePeriodDays = 0;
            this.form.isActive = this.form.shelfStatus === 'OnShelf';
            this.form.promoLabel = this.form.firstMonthFree ? 'Free for 1st month' : '';
            if (this.form.covers) {
                this.form.covers.forEach((c, idx) => { c.sortOrder = idx + 1; });
            }
            this.$emit('save', this.form);
        }
    },
    template: `
        <Modal :title="modalTitle" max-width="max-w-5xl" @close="$emit('close')">
            <div class="flex border-b border-gray-200 bg-white shrink-0 px-6 gap-1">
                <button v-for="t in [
                    {k:'basic',n:'基础信息'},
                    {k:'pricing',n:'定价与上架'},
                    {k:'ops',n:'协议与运营文案'},
                    {k:'covers',n:'保障责任'}
                ]" :key="t.k" type="button" @click="activeTab=t.k"
                    class="px-4 py-3 text-sm font-bold border-b-2 -mb-px transition"
                    :class="activeTab===t.k ? 'border-opay text-opay' : 'border-transparent text-gray-500 hover:text-gray-800'">
                    {{ t.n }}
                </button>
            </div>

            <div class="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
                <!-- BASIC -->
                <div v-show="activeTab==='basic'" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="label-std">产品编码 <span class="text-red-500">*</span></label>
                            <input v-model="form.planCode" :disabled="!isCreate || isReadonly" class="input-std font-mono" :class="(!isCreate || isReadonly) ? 'bg-gray-100' : ''" placeholder="ROSE_PLAN">
                        </div>
                        <div class="form-group">
                            <label class="label-std">产品名称 <span class="text-red-500">*</span></label>
                            <input v-model="form.planName" :disabled="isReadonly" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''">
                        </div>
                        <div class="form-group">
                            <label class="label-std">保险品类 <span class="text-red-500">*</span></label>
                            <select v-model="form.insuranceType" :disabled="isReadonly" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''">
                                <option value="">请选择</option>
                                <option v-for="c in categories" :key="c.code" :value="c.code">
                                    {{ c.name }}<template v-if="c.status === 'Integrating'">（接入中）</template>
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="label-std">承保方 <span class="text-red-500">*</span></label>
                            <select v-model="form.underwriterCode" :disabled="isReadonly" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''">
                                <option value="">请选择</option>
                                <option v-for="c in companies" :key="c.code" :value="c.code">{{ c.name }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="label-std">保司产品码</label>
                            <input v-model="form.externalProductCode" :disabled="isReadonly" class="input-std font-mono" :class="isReadonly ? 'bg-gray-100' : ''">
                        </div>
                        <div class="form-group">
                            <label class="label-std">货架排序</label>
                            <input type="number" v-model.number="form.sortOrder" :disabled="isReadonly" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''">
                        </div>
                        <div class="form-group">
                            <label class="label-std">最小投保年龄</label>
                            <input type="number" min="0" v-model.number="form.minInsuredAge" :disabled="isReadonly" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''" placeholder="可空">
                        </div>
                        <div class="form-group">
                            <label class="label-std">最大投保年龄</label>
                            <input type="number" min="0" v-model.number="form.maxInsuredAge" :disabled="isReadonly" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''" placeholder="可空">
                        </div>
                        <div class="form-group col-span-2" v-if="isHmo">
                            <label class="label-std">医院网络摘要</label>
                            <input v-model="form.providerNetworkSummary" :disabled="isReadonly" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''">
                            <p class="text-[11px] text-gray-400 mt-1">仅 HMO 产品填写</p>
                        </div>
                        <div class="form-group col-span-2">
                            <label class="label-std">短描述</label>
                            <input v-model="form.shortDescription" :disabled="isReadonly" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''">
                        </div>
                        <div class="form-group col-span-2">
                            <label class="label-std">封面图</label>
                            <input v-model="form.coverImageUrl" :disabled="isReadonly" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''" placeholder="图片 URL">
                        </div>
                    </div>

                    <div class="border-t border-gray-200 pt-4 space-y-3">
                        <h4 class="text-sm font-bold text-gray-800">续期规则</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="bg-white border border-gray-200 rounded-lg p-4">
                                <div class="flex items-end gap-3">
                                    <div class="form-group shrink-0">
                                        <label class="label-std">启用宽限期</label>
                                        <label class="flex items-center gap-2 text-sm text-gray-700 mt-1 h-9">
                                            <input type="checkbox" v-model="form.gracePeriodEnabled" :disabled="isReadonly" class="rounded border-gray-300 text-opay focus:ring-opay">
                                            启用
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <label class="label-std">宽限期天数</label>
                                        <input type="number" min="0" v-model.number="form.gracePeriodDays"
                                            :disabled="isReadonly || !form.gracePeriodEnabled"
                                            class="input-std w-24" :class="(isReadonly || !form.gracePeriodEnabled) ? 'bg-gray-100' : ''">
                                    </div>
                                </div>
                            </div>
                            <div class="bg-white border border-gray-200 rounded-lg p-4">
                                <div class="flex items-end gap-3">
                                    <div class="form-group shrink-0">
                                        <label class="label-std">续期提前扣款</label>
                                        <label class="flex items-center gap-2 text-sm text-gray-700 mt-1 h-9">
                                            <input type="checkbox" v-model="autoRenewLeadEnabled" :disabled="isReadonly"
                                                @change="onAutoRenewLeadToggle"
                                                class="rounded border-gray-300 text-opay focus:ring-opay">
                                            启用
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <label class="label-std">提前扣款天数</label>
                                        <input type="number" min="1" v-model.number="form.autoRenewLeadDays"
                                            :disabled="isReadonly || !autoRenewLeadEnabled"
                                            class="input-std w-24" :class="(isReadonly || !autoRenewLeadEnabled) ? 'bg-gray-100' : ''">
                                        <p class="text-[11px] text-gray-400 mt-1">关闭=到期日当天</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PRICING -->
                <div v-show="activeTab==='pricing'" class="space-y-4">
                    <div class="form-group">
                        <label class="label-std">支持缴费周期与价格 <span class="text-red-500">*</span></label>
                        <p class="text-[11px] text-gray-400 mb-2">勾选周期后填写对应价格；未勾选不参与上架售卖</p>
                        <div class="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
                            <div v-for="m in paymentModeOptions" :key="m.code"
                                class="flex items-center gap-4 px-4 py-3"
                                :class="hasMode(m.code) ? 'bg-green-50' : 'bg-white'">
                                <label class="flex items-center gap-2 w-28 shrink-0 text-sm font-bold text-gray-800 cursor-pointer">
                                    <input type="checkbox" :checked="hasMode(m.code)"
                                        :disabled="isReadonly"
                                        @change="toggleMode(m.code)"
                                        class="rounded border-gray-300 text-opay focus:ring-opay">
                                    {{ m.label }}
                                </label>
                                <div class="flex items-center gap-2 flex-1 max-w-xs" :class="hasMode(m.code) ? '' : 'opacity-40'">
                                    <span class="text-xs text-gray-500 shrink-0">价格 (₦)</span>
                                    <input type="number" min="0" v-model.number="form[m.priceKey]"
                                        :disabled="isReadonly || !hasMode(m.code)"
                                        class="input-std w-36" :class="(isReadonly || !hasMode(m.code)) ? 'bg-gray-100' : ''"
                                        placeholder="—">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                        <div class="form-group">
                            <label class="label-std">首月减免</label>
                            <label class="flex items-center gap-2 text-sm text-gray-700 mt-1">
                                <input type="checkbox" v-model="form.firstMonthFree" :disabled="isReadonly" class="rounded border-gray-300 text-opay focus:ring-opay">
                                启用首月减免
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="label-std">上架状态</label>
                            <select v-model="form.shelfStatus" :disabled="isReadonly" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''">
                                <option value="Draft">草稿</option>
                                <option value="OnShelf">上架</option>
                                <option value="OffShelf">下架</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- OPS -->
                <div v-show="activeTab==='ops'" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="label-std">协议名称</label>
                            <input v-model="form.brochureName" :disabled="isReadonly" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''">
                        </div>
                        <div class="form-group">
                            <label class="label-std">协议链接</label>
                            <input v-model="form.brochureUrl" :disabled="isReadonly" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''">
                        </div>
                        <div class="form-group">
                            <label class="label-std">理赔引导链接</label>
                            <input v-model="form.claimGuideUrl" :disabled="isReadonly" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''">
                        </div>
                        <div class="form-group">
                            <label class="label-std">远程问诊链接</label>
                            <input v-model="form.telemedicineUrl" :disabled="isReadonly" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''">
                        </div>
                    </div>

                    <div class="border-t border-gray-200 pt-4">
                        <div class="flex justify-between items-center mb-2">
                            <h4 class="text-sm font-bold text-gray-800">常见问题</h4>
                            <button v-if="!isReadonly" type="button" @click="addFaq" class="text-xs font-bold text-opay">+ 添加</button>
                        </div>
                        <div v-for="(faq, i) in (form.faqs || [])" :key="'faq'+i" class="bg-white border border-gray-200 rounded p-3 mb-2 space-y-2">
                            <div class="flex justify-between gap-2">
                                <input v-model="faq.q" :disabled="isReadonly" placeholder="问题" class="input-std flex-1" :class="isReadonly ? 'bg-gray-100' : ''">
                                <button v-if="!isReadonly" type="button" @click="removeFaq(i)" class="text-red-500 text-xs font-bold shrink-0">删除</button>
                            </div>
                            <textarea v-model="faq.a" :disabled="isReadonly" rows="2" placeholder="回答" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''"></textarea>
                        </div>
                    </div>

                    <div class="border-t border-gray-200 pt-4">
                        <div class="flex justify-between items-center mb-2">
                            <h4 class="text-sm font-bold text-gray-800">理赔步骤</h4>
                            <button v-if="!isReadonly" type="button" @click="addClaimStep" class="text-xs font-bold text-opay">+ 添加</button>
                        </div>
                        <div v-for="(step, i) in (form.claimSteps || [])" :key="'step'+i" class="flex gap-2 mb-2 items-start">
                            <span class="text-xs font-bold text-gray-400 w-6 pt-2">{{ i+1 }}.</span>
                            <input v-model="form.claimSteps[i]" :disabled="isReadonly" class="input-std flex-1" :class="isReadonly ? 'bg-gray-100' : ''">
                            <button v-if="!isReadonly" type="button" @click="removeClaimStep(i)" class="text-red-500 text-xs font-bold pt-2">删</button>
                        </div>
                    </div>
                </div>

                <!-- COVERS -->
                <div v-show="activeTab==='covers'" class="space-y-3">
                    <div class="flex justify-end">
                        <button v-if="!isReadonly" type="button" @click="addCover" class="text-xs font-bold text-opay">+ 添加保障责任</button>
                    </div>
                    <div v-for="(c, i) in (form.covers || [])" :key="'cover'+i" class="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-bold text-gray-400">#{{ i+1 }}</span>
                            <div class="flex gap-2" v-if="!isReadonly">
                                <button type="button" @click="moveCover(i,-1)" class="text-xs text-gray-500 font-bold">上移</button>
                                <button type="button" @click="moveCover(i,1)" class="text-xs text-gray-500 font-bold">下移</button>
                                <button type="button" @click="removeCover(i)" class="text-xs text-red-500 font-bold">删除</button>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="form-group">
                                <label class="label-std">权益编码</label>
                                <input v-model="c.coverCode" disabled class="input-std font-mono bg-gray-100">
                                <p class="text-[11px] text-gray-400 mt-1">系统内部标识，不对客展示，创建后不可改</p>
                            </div>
                            <div class="form-group">
                                <label class="label-std">权益名称</label>
                                <input v-model="c.coverName" :disabled="isReadonly" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''">
                            </div>
                            <div class="form-group">
                                <label class="label-std">额度说明</label>
                                <input v-model="c.limitText" :disabled="isReadonly" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''">
                            </div>
                            <div class="form-group">
                                <label class="label-std">生效规则副文案</label>
                                <input v-model="c.effectiveRuleSubtitle" :disabled="isReadonly" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''">
                            </div>
                            <div class="form-group col-span-2">
                                <label class="label-std">详细描述</label>
                                <textarea v-model="c.detailedDescription" :disabled="isReadonly" rows="2" class="input-std" :class="isReadonly ? 'bg-gray-100' : ''"></textarea>
                            </div>
                        </div>
                    </div>
                    <div v-if="!(form.covers && form.covers.length)" class="text-sm text-gray-400 text-center py-8">暂无保障责任配置</div>
                </div>
            </div>

            <template #footer>
                <button type="button" @click="$emit('close')" class="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900">关闭</button>
                <button v-if="!isReadonly" type="button" @click="save" class="bg-opay hover:bg-opay-hover text-white px-5 py-2 rounded text-sm font-bold shadow">保存</button>
            </template>
        </Modal>
    `
};
