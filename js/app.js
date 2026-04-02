import { checkPermission, formatMoney } from './utils.js';
import Toast from './components/Toast.js';
import DiffSnapshot from './components/DiffSnapshot.js';
import ProductForm from './components/ProductForm.js';

// Views
import ProductRegistry from './views/ProductRegistry.js';
import ItemRegistry from './views/ItemRegistry.js'; 
import FixedPlanManager from './views/FixedPlanManager.js';
import KaFixedPlanManager from './views/KAFixedPlanManager.js'; 
import TargetTemplateManager from './views/TargetTemplateManager.js';
import AcRetentionManager from './views/AcRetentionManager.js'; 
import KaWhitelistManager from './views/KaWhitelistManager.js'; // 引入KA白名单管理视图
import SystemParams from './views/SystemParams.js';
import UserManagement from './views/UserManagement.js';
import RolePermissions from './views/RolePermissions.js';

const app = Vue.createApp({
    components: {
        Toast, DiffSnapshot, ProductForm,
        ProductRegistry, ItemRegistry, FixedPlanManager, KaFixedPlanManager, 
        TargetTemplateManager, AcRetentionManager, KaWhitelistManager,
        SystemParams, UserManagement, RolePermissions
    },
    data() {
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const sysDateTime = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        return {
            configLoaded: false,
            currentRoleCode: 'SUPER_ADMIN',
            currentView: 'product_mgmt', 
            systemDate: sysDateTime, 

            productDefinitions: [], savingItems: [], fixedPlans: [], kaFixedPlans: [], 
            targetTemplates: [], acRetentionStrategies: [], kaWhitelists: [],
            rolesList: [], categories: [], systemParams: [], usersList: [],
            
            showModal: false, modalMode: 'view', modalFormType: 'product_def', editingData: {},
            showDiffModal: false, originalSnapshot: {}, pendingApprovalAction: '',
            isKaFixedApproval: false,
            toast: { show: false, title: '', msg: '', icon: '' }
        }
    },
    computed: {
        currentUser() { return { name: 'Admin', role: this.currentRoleCode }; },
        showSavingMenu() {
            return this.hasPermission('PRODUCT_MGMT:L1_PRODUCT:VIEW') || 
                   this.hasPermission('PRODUCT_MGMT:L2_ITEM:VIEW') || 
                   this.hasPermission('FIXED_OPS:SPECIAL_PLAN:VIEW') ||
                   this.hasPermission('KA_FIXED_OPS:PLAN:VIEW');
        },
        showFuncMenu() {
            return this.hasPermission('TARGET_OPS:TEMPLATE:VIEW') ||
                   this.hasPermission('TARGET_OPS:AC_RETENTION:VIEW') ||
                   this.hasPermission('TARGET_OPS:KA_WHITELIST:VIEW');
        },
        showSystemMenu() {
            return this.hasPermission('SYSTEM:PARAMS:VIEW') || 
                   this.hasPermission('SYSTEM:USER:VIEW') || 
                   this.hasPermission('SYSTEM:RBAC:VIEW');
        }
    },
    created() {
        if (typeof window.OPAY_FINANCE_CONFIG !== 'undefined') {
            this.configLoaded = true;
            const C = window.OPAY_FINANCE_CONFIG;

            this.rolesList = [
                C.roles_definition.SUPER_ADMIN,
                C.roles_definition.PRODUCT_ADMIN,
                C.roles_definition.USER
            ];

            this.categories = C.categories;
            this.productDefinitions = C.product_definitions || [];
            this.savingItems = C.saving_items || [];
            this.fixedPlans = C.fixed_plans || [];
            this.kaFixedPlans = C.ka_fixed_plans || [];
            this.targetTemplates = C.target_templates || [];
            this.acRetentionStrategies = C.ac_retention_strategies || [];
            this.kaWhitelists = C.ka_whitelists || [];

            this.systemParams = C.system_params || [];
            this.usersList = C.users || [];
        }
    },
    methods: {
        hasPermission(perm) {
            return checkPermission(perm, this.currentRoleCode, this.rolesList);
        },
        showToast(title, icon='✅') {
            this.toast = { show: true, title, msg: '', icon };
            setTimeout(() => this.toast.show = false, 3000);
        },
        navClass(view) {
            return this.currentView === view 
                ? 'bg-opay-light text-opay font-bold border-r-2 border-opay fill-opay' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-r-2 border-transparent fill-gray-500';
        },
        addDays(n) {
            const d = new Date(this.systemDate);
            d.setDate(d.getDate() + n);
            const pad = num => num.toString().padStart(2, '0');
            this.systemDate = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            this.showToast(`系统时间: ${this.systemDate.replace('T', ' ')}`, '📅');
        },
        
        openRegistryModal(actionType, data) {
            this.showModal = true;
            this.editingData = JSON.parse(JSON.stringify(data || {}));
            if (actionType.includes('product_def')) {
                this.modalFormType = 'product_def';
                this.modalMode = actionType.includes('view') ? 'view' : 'edit';
            } else {
                this.modalFormType = 'item';
                this.modalMode = actionType.includes('view') ? 'view' : 'edit';
            }
        },
        handleSaveRegistry() {
            if (this.modalFormType === 'item') this.initiateApproval(this.editingData, 'modify_item', false);
        },
        initiateApprovalFromChild(data, action, isKaFixed = false) { 
            this.initiateApproval(data, action, isKaFixed); 
        },
        initiateApproval(data, action, isKaFixed = false) {
            this.editingData = data; 
            this.pendingApprovalAction = action;
            this.isKaFixedApproval = isKaFixed;

            if (action === 'save_draft') { this.confirmApproval(); return; }
            
            if (action === 'modify_item') {
                this.originalSnapshot = JSON.parse(JSON.stringify(this.savingItems.find(i => i.item_code === data.item_code) || {}));
            } else if (['apply_listing', 'modify_fixed', 'off_shelf'].includes(action)) {
                const targetArray = isKaFixed ? this.kaFixedPlans : this.fixedPlans;
                this.originalSnapshot = JSON.parse(JSON.stringify(targetArray.find(p => p.plan_id === data.plan_id) || {}));
            }
            this.showModal = false; 
            this.showDiffModal = true;
        },
        confirmApproval() {
            if (this.pendingApprovalAction === 'modify_item') {
                const idx = this.savingItems.findIndex(i => i.item_code === this.editingData.item_code);
                if(idx !== -1) this.savingItems[idx].pending_rate_config = this.editingData.interest_rate;
                this.showToast('单品修改已提交审批', '🔒');
            } 
            else if (this.pendingApprovalAction === 'save_draft') {
                const targetArray = this.isKaFixedApproval ? this.kaFixedPlans : this.fixedPlans;
                targetArray.push(this.editingData);
                this.showToast('草稿已保存');
            }
            else {
                const targetArray = this.isKaFixedApproval ? this.kaFixedPlans : this.fixedPlans;
                const idx = targetArray.findIndex(p => p.plan_id === this.editingData.plan_id);
                
                if (idx !== -1) {
                    if (this.pendingApprovalAction === 'apply_listing') targetArray[idx].status = 'Pending_Approval';
                    else if (this.pendingApprovalAction === 'modify_fixed') {
                        this.editingData.status = 'Pending_Modification';
                        targetArray[idx] = this.editingData;
                    }
                    else if (this.pendingApprovalAction === 'off_shelf') targetArray[idx].status = 'Pending_OffShelf';
                }
                this.showToast('审批申请已提交', '⏳');
            }
            this.showDiffModal = false;
        },
        handleMockPass(planOrItem) {
            if (planOrItem.plan_id) {
                let nextStatus = planOrItem.status;
                if (planOrItem.status === 'Pending_Approval') nextStatus = 'Approved'; 
                if (planOrItem.status === 'Pending_Modification') nextStatus = 'Active';
                if (planOrItem.status === 'Pending_OffShelf') nextStatus = 'Suspended';
                
                let idx = this.fixedPlans.findIndex(p => p.plan_id === planOrItem.plan_id);
                if(idx !== -1) this.fixedPlans[idx].status = nextStatus;
                else {
                    idx = this.kaFixedPlans.findIndex(p => p.plan_id === planOrItem.plan_id);
                    if(idx !== -1) this.kaFixedPlans[idx].status = nextStatus;
                }
                this.showToast(`单品审批通过!`, '✅');
            } else if (planOrItem.item_code) {
                const idx = this.savingItems.findIndex(i => i.item_code === planOrItem.item_code);
                if(idx !== -1 && this.savingItems[idx].pending_rate_config) {
                    this.savingItems[idx].interest_rate = this.savingItems[idx].pending_rate_config;
                    delete this.savingItems[idx].pending_rate_config;
                    this.showToast(`单品变更已生效`, '✅');
                }
            }
        },
        handleItemMockPass(item) { this.handleMockPass(item); },
        refreshFixedStats() {
            let count = 0;
            const now = this.systemDate;
            
            const updater = (p) => {
                const isExpired = p.sale_end_time && p.sale_end_time < now;
                if(!isExpired && (p.status === 'Active') && !p.is_unlimited_quota && p.sold_amount < p.total_issuance_amount) {
                    const add = Math.floor(p.total_issuance_amount * 0.05);
                    p.sold_amount = Math.min(p.total_issuance_amount, p.sold_amount + add);
                    count++;
                }
            };

            this.fixedPlans.forEach(updater);
            this.kaFixedPlans.forEach(updater);

            this.showToast(`已刷新 ${count} 个在售产品销量`);
        },
        handleDeletePlan(plan, isKaFixed) {
            const targetArray = isKaFixed ? this.kaFixedPlans : this.fixedPlans;
            const idx = targetArray.findIndex(p => p.plan_id === plan.plan_id);
            if (idx !== -1) {
                targetArray.splice(idx, 1);
                this.showToast('草稿已删除', '🗑️');
            }
        },
        handleCreateTemplate(tpl) { this.targetTemplates.push(tpl); this.showToast('模板已创建'); },
        handleUpdateTemplate(tpl) { const idx = this.targetTemplates.findIndex(t => t.template_no === tpl.template_no); if(idx !== -1) this.targetTemplates[idx] = tpl; this.showToast('模板配置已更新'); },
        handleDeleteTemplate(tpl) { const idx = this.targetTemplates.findIndex(t => t.template_no === tpl.template_no); if (idx !== -1) { this.targetTemplates.splice(idx, 1); this.showToast('模板已删除', '🗑️'); } },
        
        // 新增的 AC 挽留策略处理方法
        handleCreateStrategy(s) { this.acRetentionStrategies.push(s); this.showToast('策略已创建并生效'); },
        handleUpdateStrategy(s) { 
            const idx = this.acRetentionStrategies.findIndex(x => x.id === s.id); 
            if(idx !== -1) this.acRetentionStrategies[idx] = s; 
            this.showToast('策略已更新'); 
        },
        handleDeleteStrategy(s) {
            const idx = this.acRetentionStrategies.findIndex(x => x.id === s.id);
            if(idx !== -1) {
                this.acRetentionStrategies.splice(idx, 1);
                this.showToast('策略已删除', '🗑️');
            }
        },

        // 新增 KA 白名单相关处理方法
        handleCreateKaWhitelist(wl) { this.kaWhitelists.push(wl); this.showToast('白名单已创建'); },
        handleUpdateKaWhitelist(wl) { 
            const idx = this.kaWhitelists.findIndex(x => x.id === wl.id); 
            if(idx !== -1) this.kaWhitelists[idx] = wl; 
            this.showToast('白名单已更新'); 
        },
        handleDeleteKaWhitelist(wl) {
            const idx = this.kaWhitelists.findIndex(x => x.id === wl.id);
            if(idx !== -1) {
                this.kaWhitelists.splice(idx, 1);
                this.showToast('白名单已删除', '🗑️');
            }
        },

        handleUpdateParam(key, val) { const p = this.systemParams.find(x => x.key === key); if(p) p.value = val; this.showToast('参数已保存'); },
        handleAddParam(p) { this.systemParams.push(p); this.showToast('参数已添加'); },
        handleAddUser(user) { this.usersList.push({ id: Date.now(), name: user.name, role: user.roles }); this.showToast('用户已添加'); },
        handleUpdateUser(user) {
            const idx = this.usersList.findIndex(u => u.id === user.id);
            if (idx !== -1) {
                this.usersList[idx].role = user.roles;
                this.showToast('用户角色已更新');
            }
        },
        handleUpdateUserRole(user, roleCode) { user.role = roleCode; this.showToast('权限已更新'); },
        handleSaveRole(role, mode) { if (mode === 'create') this.rolesList.push(role); else { const idx = this.rolesList.findIndex(r => r.code === role.code); if (idx !== -1) this.rolesList[idx] = role; } this.showToast('配置已保存'); }
    },
    template: `
        <div v-if="!configLoaded" class="fixed inset-0 z-50 bg-red-50 flex items-center justify-center">
            <div class="text-center"><h1 class="text-2xl font-bold text-red-700">配置加载失败</h1></div>
        </div>

        <header class="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-opay flex items-center justify-center text-white font-bold text-lg">O</div>
                <span class="font-bold text-lg tracking-tight text-gray-800">OPay <span class="text-opay">Savings</span></span>
            </div>
            <div class="flex items-center gap-4">
                <select v-model="currentRoleCode" class="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs font-bold text-gray-700 outline-none">
                    <option v-for="role in rolesList" :key="role.code" :value="role.code">
                        {{ role.name }} {{ role.code === 'SUPER_ADMIN' ? '(Debug)' : '' }}
                    </option>
                </select>
                <div class="flex items-center gap-2 text-xs text-gray-500">
                    <div class="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600">{{ currentUser.name.charAt(0) }}</div>
                    {{ currentUser.name }}
                </div>
            </div>
        </header>

        <div class="flex flex-1 overflow-hidden bg-gray-50">
            <aside class="w-64 bg-white border-r border-gray-200 flex flex-col py-6 select-none overflow-y-auto">
                <div class="mb-8" v-if="showSavingMenu">
                    <div class="px-6 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Saving产品管理</div>
                    <nav class="flex flex-col space-y-1">
                        <a href="#" v-if="hasPermission('PRODUCT_MGMT:L1_PRODUCT:VIEW')" @click.prevent="currentView = 'product_mgmt'" :class="navClass('product_mgmt')" class="px-6 py-2.5 text-sm transition-colors flex items-center gap-3">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                            产品管理
                        </a>
                        <a href="#" v-if="hasPermission('PRODUCT_MGMT:L2_ITEM:VIEW')" @click.prevent="currentView = 'item_mgmt'" :class="navClass('item_mgmt')" class="px-6 py-2.5 text-sm transition-colors flex items-center gap-3">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                            标准单品管理
                        </a>
                        <a href="#" v-if="hasPermission('FIXED_OPS:SPECIAL_PLAN:VIEW')" @click.prevent="currentView = 'fixed_ops'" :class="navClass('fixed_ops')" class="px-6 py-2.5 text-sm transition-colors flex items-center gap-3">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            Fixed Special管理
                        </a>
                        <a href="#" v-if="hasPermission('KA_FIXED_OPS:PLAN:VIEW')" @click.prevent="currentView = 'ka_fixed_ops'" :class="navClass('ka_fixed_ops')" class="px-6 py-2.5 text-sm transition-colors flex items-center gap-3">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                            KA Fixed管理
                        </a>
                    </nav>
                </div>
                <div class="mb-8" v-if="showFuncMenu">
                    <div class="px-6 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">功能管理</div>
                    <nav class="flex flex-col space-y-1">
                        <a href="#" v-if="hasPermission('TARGET_OPS:TEMPLATE:VIEW')" @click.prevent="currentView = 'target_ops'" :class="navClass('target_ops')" class="px-6 py-2.5 text-sm transition-colors flex items-center gap-3">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                            Target场景模板
                        </a>
                        <a href="#" v-if="hasPermission('TARGET_OPS:AC_RETENTION:VIEW')" @click.prevent="currentView = 'ac_retention'" :class="navClass('ac_retention')" class="px-6 py-2.5 text-sm transition-colors flex items-center gap-3">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"></path></svg>
                            AC转账挽留策略
                        </a>
                        <a href="#" v-if="hasPermission('TARGET_OPS:KA_WHITELIST:VIEW')" @click.prevent="currentView = 'ka_whitelist'" :class="navClass('ka_whitelist')" class="px-6 py-2.5 text-sm transition-colors flex items-center gap-3">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                            KA Fixed白名单人群
                        </a>
                    </nav>
                </div>
                
                <!-- 恢复被遗漏的系统管理模块 -->
                <div v-if="showSystemMenu">
                    <div class="px-6 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">系统管理</div>
                    <nav class="flex flex-col space-y-1">
                        <a href="#" v-if="hasPermission('SYSTEM:PARAMS:VIEW')" @click.prevent="currentView = 'params'" :class="navClass('params')" class="px-6 py-2.5 text-sm transition-colors flex items-center gap-3">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            系统参数
                        </a>
                        <a href="#" v-if="hasPermission('SYSTEM:USER:VIEW')" @click.prevent="currentView = 'users'" :class="navClass('users')" class="px-6 py-2.5 text-sm transition-colors flex items-center gap-3">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            用户管理
                        </a>
                        <a href="#" v-if="hasPermission('SYSTEM:RBAC:VIEW')" @click.prevent="currentView = 'permissions'" :class="navClass('permissions')" class="px-6 py-2.5 text-sm transition-colors flex items-center gap-3">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            权限配置
                        </a>
                    </nav>
                </div>
            </aside>

            <main class="flex-1 overflow-auto p-8 relative">
                <ProductRegistry v-if="currentView === 'product_mgmt'" :product-definitions="productDefinitions" :categories="categories" :role-code="currentRoleCode" :has-permission="hasPermission" @open-modal="openRegistryModal" />
                <ItemRegistry v-if="currentView === 'item_mgmt'" :saving-items="savingItems" :product-definitions="productDefinitions" :has-permission="hasPermission" @open-modal="openRegistryModal" @mock-pass-item="handleItemMockPass" />
                
                <FixedPlanManager v-if="currentView === 'fixed_ops'" :isKaFixed="false" :plans="fixedPlans" :items="savingItems" :system-date="systemDate" :has-permission="hasPermission" @initiate-approval="initiateApprovalFromChild" @mock-audit-pass="handleMockPass" @refresh-stats="refreshFixedStats" @delete-plan="handleDeletePlan" />
                
                <KaFixedPlanManager v-if="currentView === 'ka_fixed_ops'" :plans="kaFixedPlans" :items="savingItems" :system-date="systemDate" :has-permission="hasPermission" @initiate-approval="initiateApprovalFromChild" @mock-audit-pass="handleMockPass" @refresh-stats="refreshFixedStats" @delete-plan="handleDeletePlan" />

                <TargetTemplateManager v-if="currentView === 'target_ops'" :templates="targetTemplates" :items="savingItems" @create-template="handleCreateTemplate" @update-template="handleUpdateTemplate" @delete-template="handleDeleteTemplate" />
                
                <AcRetentionManager v-if="currentView === 'ac_retention'" :strategies="acRetentionStrategies" :has-permission="hasPermission" @create-strategy="handleCreateStrategy" @update-strategy="handleUpdateStrategy" @delete-strategy="handleDeleteStrategy" />

                <!-- 新增的 KA 白名单管理视图 -->
                <KaWhitelistManager v-if="currentView === 'ka_whitelist'" :whitelists="kaWhitelists" :has-permission="hasPermission" @create-whitelist="handleCreateKaWhitelist" @update-whitelist="handleUpdateKaWhitelist" @delete-whitelist="handleDeleteKaWhitelist" />

                <SystemParams v-if="currentView === 'params'" :params="systemParams" :has-permission="hasPermission" @update-param="handleUpdateParam" @add-param="handleAddParam" />
                <UserManagement v-if="currentView === 'users'" :users="usersList" :roles="rolesList" :has-permission="hasPermission" @add-user="handleAddUser" @update-user="handleUpdateUser" />
                <RolePermissions v-if="currentView === 'permissions'" :roles="rolesList" :has-permission="hasPermission" @save-role="handleSaveRole" />
            </main>
        </div>

        <ProductForm v-if="showModal" v-model="editingData" :mode="modalMode" :form-type="modalFormType" :categories="categories" @close="showModal = false" @save="handleSaveRegistry" />

        <DiffSnapshot v-if="showDiffModal" :original-snapshot="originalSnapshot" :editing-product="editingData" :target-status="pendingApprovalAction.includes('apply_listing') ? 'Pending Approval' : (pendingApprovalAction.includes('modify') ? 'Pending Mod' : (pendingApprovalAction === 'off_shelf' ? 'Pending Off' : 'Active'))" :action-type="pendingApprovalAction" @close="showDiffModal = false" @confirm="confirmApproval" />

        <div class="fixed bottom-4 left-4 z-[100] bg-gray-800 text-white p-3 rounded-lg shadow-xl opacity-90 hover:opacity-100 transition">
            <div class="text-[10px] text-gray-400 mb-1 font-bold uppercase">Time Travel</div>
            <div class="flex items-center gap-2">
                <div class="font-mono text-sm bg-black px-2 py-1 rounded">{{ systemDate.replace('T', ' ') }}</div>
                <button @click="addDays(1)" class="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs">+1D</button>
                <button @click="addDays(30)" class="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs">+1M</button>
            </div>
        </div>
        <Toast :show="toast.show" :title="toast.title" :msg="toast.msg" :icon="toast.icon" />
    `
});

app.mount('#app');