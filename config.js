// config.js - 增加 AC 转账挽留策略数据结构和权限

(function() {
    const today = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    
    const fmtDateTime = (d) => {
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    
    const addDays = (d, n) => { const newD = new Date(d); newD.setDate(newD.getDate() + n); return newD; };

    const mockToday = new Date(today);
    mockToday.setHours(10, 0, 0); 
    
    const D_TODAY = fmtDateTime(mockToday);
    const D_YESTERDAY = fmtDateTime(addDays(mockToday, -1));
    const D_TOMORROW = fmtDateTime(addDays(mockToday, 1));
    const D_NEXT_MONTH = fmtDateTime(addDays(mockToday, 30));
    const D_LAST_MONTH = fmtDateTime(addDays(mockToday, -30));
    const D_NEXT_YEAR = fmtDateTime(addDays(mockToday, 365));

    const IMG_XMAS = "https://files.opayweb.com/image/26c719690fc30487eb51a900db9e100d.png";
    const BG_XMAS = "https://files.opayweb.com/image/0c139af3722ea067ed956db7ac6f6d5a.webp";
    const IMG_SCHOOL = "https://files.opayweb.com/image/8d42fc74beba45b7a361bb5566c2a8bc.png";
    const BG_SCHOOL = "https://files.opayweb.com/image/e627dcab8f13a43d1df969f75c8701f3.webp";
    const IMG_OFFICE = "https://files.opayweb.com/image/297f2c2457d6b971e629e161c518d4e7.png";
    const BG_OFFICE = "https://files.opayweb.com/image/d7139ad7260c218bc8b8d8bcf57a4978.webp";
    const IMG_PHONE = "https://files.opayweb.com/image/a3953f97a17a783e4f060a778bf47d8c.png"; 

    window.OPAY_FINANCE_CONFIG = {
        roles_definition: {
            SUPER_ADMIN: { code: 'SUPER_ADMIN', name: 'Super Admin', permissions: ['*'] },
            PRODUCT_ADMIN: { 
                code: 'PRODUCT_ADMIN', 
                name: 'Product Manager', 
                permissions: [
                    'PRODUCT_MGMT:L1_PRODUCT:VIEW',
                    'PRODUCT_MGMT:L2_ITEM:VIEW', 'PRODUCT_MGMT:L2_ITEM:EDIT',
                    'FIXED_OPS:SPECIAL_PLAN:VIEW', 'FIXED_OPS:SPECIAL_PLAN:CREATE', 'FIXED_OPS:SPECIAL_PLAN:EDIT', 'FIXED_OPS:SPECIAL_PLAN:PUBLISH', 'FIXED_OPS:SPECIAL_PLAN:OFFSHELF',
                    'KA_FIXED_OPS:PLAN:VIEW', 'KA_FIXED_OPS:PLAN:CREATE', 'KA_FIXED_OPS:PLAN:EDIT', 'KA_FIXED_OPS:PLAN:PUBLISH', 'KA_FIXED_OPS:PLAN:OFFSHELF',
                    'TARGET_OPS:TEMPLATE:VIEW', 'TARGET_OPS:TEMPLATE:EDIT',
                    'TARGET_OPS:AC_RETENTION:VIEW', 'TARGET_OPS:AC_RETENTION:CREATE', 'TARGET_OPS:AC_RETENTION:EDIT',
                    'TARGET_OPS:KA_WHITELIST:VIEW', 'TARGET_OPS:KA_WHITELIST:CREATE', 'TARGET_OPS:KA_WHITELIST:EDIT',
                    'TARGET_OPS:TEXT_LINK:VIEW', 'TARGET_OPS:TEXT_LINK:CREATE', 'TARGET_OPS:TEXT_LINK:EDIT',
                    'INSURANCE_MGMT:PLAN:VIEW', 'INSURANCE_MGMT:PLAN:CREATE', 'INSURANCE_MGMT:PLAN:EDIT',
                    'INSURANCE_MGMT:CATEGORY:VIEW', 'INSURANCE_MGMT:CATEGORY:CREATE', 'INSURANCE_MGMT:CATEGORY:EDIT',
                    'INSURANCE_MGMT:COMPANY:VIEW', 'INSURANCE_MGMT:COMPANY:CREATE', 'INSURANCE_MGMT:COMPANY:EDIT',
                    'SYSTEM:PARAMS:VIEW', 'SYSTEM:USER:VIEW', 'SYSTEM:RBAC:VIEW'
                ]
            },
            USER: { code: 'USER', name: 'General User', permissions: [
                'PRODUCT_MGMT:L1_PRODUCT:VIEW', 'PRODUCT_MGMT:L2_ITEM:VIEW', 'FIXED_OPS:SPECIAL_PLAN:VIEW', 'KA_FIXED_OPS:PLAN:VIEW',
                'TARGET_OPS:KA_WHITELIST:VIEW', 'TARGET_OPS:TEXT_LINK:VIEW',
                'INSURANCE_MGMT:PLAN:VIEW', 'INSURANCE_MGMT:CATEGORY:VIEW', 'INSURANCE_MGMT:COMPANY:VIEW'
            ] }
        },
        users: [
            { id: 1, name: 'Admin User', role: 'SUPER_ADMIN' },
            { id: 2, name: 'Product Lead', role: 'PRODUCT_ADMIN' },
            { id: 3, name: 'Viewer', role: 'USER' }
        ],
        product_definitions: [
            { product_code: 'OWealth', name: 'OWealth', category: 'OWealth', fund_merchant_no: 'MCH_OW_001', tax_rate: 0.10, tax_bearer: 'USER', status: 'Active', product_protocol: 'https://opay.com/legal/owealth' },
            { product_code: 'Targets', name: 'Targets', category: 'Targets', fund_merchant_no: 'MCH_TG_001', tax_rate: 0.10, tax_bearer: 'USER', status: 'Active', product_protocol: 'https://opay.com/legal/targets' },
            { product_code: 'Fixed', name: 'Fixed', category: 'Fixed', fund_merchant_no: 'MCH_FX_001', tax_rate: 0.10, tax_bearer: 'USER', status: 'Active', product_protocol: 'https://opay.com/legal/fixed' },
            { product_code: 'KA Fixed', name: 'KA Fixed', category: 'Fixed', fund_merchant_no: 'MCH_KAFX_001', tax_rate: 0.10, tax_bearer: 'USER', status: 'Active', product_protocol: 'https://opay.com/legal/ka-fixed' },
            { product_code: 'SafeBox', name: 'SafeBox', category: 'SafeBox', fund_merchant_no: 'MCH_SB_001', tax_rate: 0.00, tax_bearer: 'N/A', status: 'Active', product_protocol: 'https://opay.com/legal/safebox' },
            { product_code: 'Spend & Save', name: 'Spend & Save', category: 'Spend & Save', fund_merchant_no: 'MCH_SS_001', tax_rate: 0.10, tax_bearer: 'USER', status: 'Active', product_protocol: 'https://opay.com/legal/spendsave' },
            { product_code: 'Sub-account', name: 'Sub-account', category: 'Sub-account', fund_merchant_no: 'MCH_SUB_001', tax_rate: 0.10, tax_bearer: 'USER', status: 'Active', product_protocol: 'https://opay.com/legal/subaccount' },
            { product_code: 'Superbalance', name: 'Superbalance', category: 'Superbalance', fund_merchant_no: 'MCH_SUP_001', tax_rate: 0.10, tax_bearer: 'USER', status: 'Active', product_protocol: 'https://opay.com/legal/superbalance' }
        ],
        saving_items: [
            { item_code: 'OWealth', product_code: 'OWealth', item_name: 'OWealth', interest_rate: { type: 'tiered', rules: [{rate: 0.15, min: 0}, {rate: 0.05, min: 10000000}] }, status: 'Active' },
            { item_code: 'Targets', product_code: 'Targets', item_name: 'Targets', interest_rate: { type: 'tiered', rules: [{rate: 0.15, min: 0}, {rate: 0.06, min: 30000000}] }, status: 'Active', sync_status: 'SYNCING' },
            { item_code: 'SafeBox', product_code: 'SafeBox', item_name: 'SafeBox', interest_rate: { type: 'tiered', rules: [{rate: 0.15, min: 0}, {rate: 0.06, min: 30000000}] }, status: 'Active' },
            { item_code: 'Spend & Save', product_code: 'Spend & Save', item_name: 'Spend & Save', interest_rate: { type: 'tiered', rules: [{rate: 0.15, min: 0}, {rate: 0.05, min: 10000000}] }, status: 'Active' },
            { item_code: 'Sub-account', product_code: 'Sub-account', item_name: 'Sub-account', interest_rate: { type: 'tiered', rules: [{rate: 0.15, min: 0}, {rate: 0.05, min: 10000000}] }, status: 'Active' },
            { item_code: 'Superbalance', product_code: 'Superbalance', item_name: 'Superbalance', interest_rate: { type: 'flat', value: 0.05 }, status: 'Active' },
            { item_code: 'Fixed_100401', product_code: 'Fixed', item_name: 'Fixed 100401 (Std)', interest_rate: { type: 'tiered', rules: [{rate: 0.15, min: 0}, {rate: 0.06, min: 30000000}] }, status: 'Active' },
            { item_code: 'Fixed_100402', product_code: 'Fixed', item_name: 'Fixed 100402 (Std)', interest_rate: { type: 'tiered', rules: [{rate: 0.16, min: 0}, {rate: 0.07, min: 30000000}] }, status: 'Active' },
            { item_code: 'Fixed_Special_Base', product_code: 'Fixed', item_name: 'Fixed Special Base Item', interest_rate: { type: 'flat', value: 0.10 }, status: 'Active' },
            { item_code: 'KA_Fixed_Base', product_code: 'KA Fixed', item_name: 'KA Fixed Base Item', interest_rate: { type: 'flat', value: 0.12 }, status: 'Active' }
        ],
        fixed_plans: [
            {
                plan_id: 'PLAN_FX_DRAFT_001', item_code: 'Fixed_Special_Base', name: 'New User Promo Draft', alias: 'New User 20%',
                is_unlimited_quota: false, total_issuance_amount: 500000000, sold_amount: 0, min_sub_amount: 1000, max_single_sub: 100000, cum_sub_limit: 500000,
                period_days: 7, sale_start_time: D_TOMORROW, sale_end_time: D_NEXT_MONTH,
                status: 'Draft', target_audience_id: '1001', 
                rates: [{ stepMinAmount: 0, rate: 0.20 }], benchmark_rate: 0.12
            },
            {
                plan_id: 'PLAN_FX_ACTIVE_001', item_code: 'Fixed_Special_Base', name: 'Spring Festival Special', alias: 'Spring Special 15%',
                is_unlimited_quota: false, total_issuance_amount: 1000000000, sold_amount: 450000000, min_sub_amount: 5000, max_single_sub: 5000000, cum_sub_limit: 10000000,
                period_days: 14, sale_start_time: D_TODAY, sale_end_time: D_NEXT_MONTH,
                status: 'Active', target_audience_id: '2023', 
                rates: [{ stepMinAmount: 0, rate: 0.15 }], benchmark_rate: 0.10
            },
            {
                plan_id: 'PLAN_FX_APPROVED_001', item_code: 'Fixed_Special_Base', name: 'Valentine Exclusive', alias: 'Love Save 18%',
                is_unlimited_quota: false, total_issuance_amount: 200000000, sold_amount: 0, min_sub_amount: 10000, max_single_sub: 1000000, cum_sub_limit: 2000000,
                period_days: 30, sale_start_time: D_NEXT_MONTH, sale_end_time: D_NEXT_YEAR,
                status: 'Approved', target_audience_id: '5200', 
                rates: [{ stepMinAmount: 0, rate: 0.18 }], benchmark_rate: 0.12
            }
        ],
        ka_fixed_plans: [
            {
                plan_id: 'PLAN_KAFX_ACTIVE_001', item_code: 'KA_Fixed_Base', name: 'KA VIP Q1 Exclusive', alias: 'VIP Q1',
                is_unlimited_quota: true, total_issuance_amount: null, sold_amount: 150000000, min_sub_amount: 500000, max_single_sub: null, cum_sub_limit: null,
                period_days: 30, sale_start_time: D_TODAY, sale_end_time: D_NEXT_MONTH,
                status: 'Active', target_audience_id: '8888',
                rates: [{ stepMinAmount: 0, rate: 0.18 }], benchmark_rate: 0.14
            },
            {
                plan_id: 'PLAN_KAFX_DRAFT_001', item_code: 'KA_Fixed_Base', name: 'KA Enterprise Plan', alias: 'Enterprise 20%',
                is_unlimited_quota: false, total_issuance_amount: 5000000000, sold_amount: 0, min_sub_amount: 1000000, max_single_sub: 50000000, cum_sub_limit: 100000000,
                period_days: 90, sale_start_time: D_TOMORROW, sale_end_time: D_NEXT_YEAR,
                status: 'Draft', target_audience_id: '9999',
                rates: [{ stepMinAmount: 0, rate: 0.20 }], benchmark_rate: 0.15
            }
        ],
        target_templates: [
            { template_no: '2111', item_code: 'Targets', name: 'Christmas 2026', rec_type: 'festival', reason_type: 9, icon: IMG_XMAS, card_background: BG_XMAS, pinned_sorting: 100, target_amount: 2000000, target_amounts: [2000000, 5000000, 10000000], target_amounts_desc: ['Standard', 'Premium', 'Luxurious'], period_type: 0, end_date: '2026-12-23', duration: null, expire_date: '2026-12-15', keywords: 'christmas,santa', base_members: 1000, template_status: 1, is_show: 1 }
        ],
        ac_retention_strategies: [
            {
                id: 'STR-2026-001', name: 'OWealth 未激活引导', priority: 99, status: 1, popupType: 'custom', operator: 'Admin', updateTime: '2026-03-23',
                target_audience_id: '',
                script: "context.isAutoSaveOpen == false",
                show: true, protocolText: "I have read and agree to the Terms", urlTermsConditions: "https://opay.com/tc", urlPrivacyPolicy: "https://opay.com/pp",
                icon: "https://files.opayweb.com/image/26c719690fc30487eb51a900db9e100d.png", title: "Earn 5% P.A. Daily!", brief: "Turn on AutoSave now.", image: "https://files.opayweb.com/image/0c139af3722ea067ed956db7ac6f6d5a.webp", buttonLeftTxt: "Not Now", buttonRightTxt: "Turn On", buttonUrl: "app://action/claim_coupon"
            },
            {
                id: 'STR-2026-002', name: 'MP转账截留', priority: 80, status: 0, popupType: 'autosave', operator: 'System', updateTime: '2026-03-22',
                target_audience_id: '9999',
                script: "context.transferAmount >= 5000 && context.bankName == 'Monie Point'",
                show: true, protocolText: "Agree to Autosave", urlTermsConditions: "https://opay.com/tc", urlPrivacyPolicy: "https://opay.com/pp",
                icon: "https://files.opayweb.com/image/8d42fc74beba45b7a361bb5566c2a8bc.png", title: "Autosave Enabled", brief: "Save easily.", image: "", buttonLeftTxt: "Cancel", buttonRightTxt: "Confirm", buttonUrl: ""
            }
        ],
        ka_whitelists: [
            { id: 1001, name: 'KA VIP Core 1001', count: 2, updateTime: D_YESTERDAY.split('T')[0], users: ['256626040238006', '256626040201931'] }
        ],
        text_link_strategies: [
            { strategy_id: 'STR-000001', name: '理财未开户资产引导', crowd_rule: '1023', display_text: 'Upgrade balance account to <font color="#31C086">get daily interest ></font>', link_url: 'https://owealthh5.opayweb.com/owealth/aggressive-promotion-new', weight: 1, status: 1, start_time: '', end_time: '' }
        ],
        categories: [
            { code: 'OWealth', name: 'OWealth' }, { code: 'Targets', name: 'Targets' }, { code: 'Fixed', name: 'Fixed' },
            { code: 'SafeBox', name: 'SafeBox' }, { code: 'Spend & Save', name: 'Spend & Save' }, { code: 'Sub-account', name: 'Sub-account' },
            { code: 'Superbalance', name: 'Superbalance' }
        ],
        // —— Insurance 管理台（对齐 docs/insurance/08-domain-fact-statement.md）——
        insurance_categories: [
            { code: 'HMO', name: 'HMO 保险', description: '医疗险 / Health Maintenance Organization', status: 'Active', sortOrder: 1 },
            { code: 'PA', name: '意外险', description: 'Personal Accident；一期对接中（AIICO）', status: 'Integrating', sortOrder: 2 }
        ],
        insurance_companies: [
            { code: 'NEM', name: 'NEM Insurance', shortName: 'NEM', description: '一期 HMO 承保方（Rose Plan）', status: 'Active', sortOrder: 1 },
            { code: 'AIICO', name: 'AIICO Insurance', shortName: 'AIICO', description: '一期意外险承保方（接入中）', status: 'Active', sortOrder: 2 }
        ],
        insurance_plans: [
            {
                planCode: 'ROSE_PLAN',
                underwriterCode: 'NEM',
                planName: 'OPay Rose Plan',
                externalProductCode: 'nem_health_basic',
                insuranceType: 'HMO',
                providerNetworkSummary: 'Tier 1 selected hospitals nationwide, Nigeria (Cashless HMO)',
                gracePeriodEnabled: true,
                gracePeriodDays: 7,
                autoRenewLeadDays: 0,
                supportedPaymentModes: ['MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL'],
                monthlyPrice: 1500,
                quarterlyPrice: 4500,
                biannualPrice: 9000,
                annualPrice: 18000,
                shelfStatus: 'OnShelf',
                isActive: true,
                firstMonthFree: true,
                promoLabel: 'Free for 1st month',
                minInsuredAge: 18,
                maxInsuredAge: 65,
                sortOrder: 1,
                shortDescription: '24/7 tele-consultation, Tier 1 cashless hospitals, annual limit ₦200,000',
                brochureName: 'OPay Rose Plan Product Brochure',
                brochureUrl: 'https://example.com/docs/opay-rose-plan-brochure.pdf',
                claimGuideUrl: 'https://example.com/docs/opay-rose-claim-guide',
                telemedicineUrl: 'https://example.com/telemedicine/nem',
                coverImageUrl: 'https://files.opayweb.com/image/26c719690fc30487eb51a900db9e100d.png',
                faqs: [
                    { q: 'Is there a waiting period before I can access coverage?', a: 'Yes. Certain benefits unlock after 3 to 6 months of continuous coverage (T3 / T6 / T9).' },
                    { q: 'Is there an age limit for the plan?', a: 'Yes, this plan covers ages 18–65 years.' }
                ],
                claimSteps: [
                    'Enrollee completes registration and receives a welcome message by SMS or email.',
                    'Find a nearby hospital in the App hospital network to access care.',
                    'Visit the hospital and present your Policy No. (or registered phone number) as enrollee ID.'
                ],
                covers: [
                    { coverCode: 'OUTPATIENT', coverName: 'Out Patient Care', limitText: 'Subject to Overall Limit', effectiveRuleSubtitle: 'Effective after 3 months continuous cover · subject to annual limit', detailedDescription: 'Covers consultation fees, basic examination, and routine outpatient care at in-network Tier 1 facilities.', sortOrder: 1 },
                    { coverCode: 'EMERGENCY', coverName: 'Accident and Emergency', limitText: '₦30,000', effectiveRuleSubtitle: 'Effective immediately · per-visit sub-limit applies', detailedDescription: 'Immediate emergency and accident care at network hospitals. No waiting period (T0).', sortOrder: 2 },
                    { coverCode: 'SURGERY', coverName: 'Surgical Services', limitText: '₦50,000 (₦100,000 after T9)', effectiveRuleSubtitle: 'T6 unlock ₦50K · T9 upgrades to ₦100K', detailedDescription: 'Eligible surgical procedures after 6 months continuous cover (T6).', sortOrder: 3 },
                    { coverCode: 'ADDITIONAL', coverName: 'Additional Cares', limitText: 'Telemedicine / Online consult', effectiveRuleSubtitle: 'Telemedicine T0', detailedDescription: 'Includes 24/7 tele-consultation (T0) and other supplementary benefits.', sortOrder: 4 }
                ]
            }
        ],
        system_params: [
            { key: 'EXAMPLE_VARIABLE', value: '1.0', desc: 'Example Parameter' }
        ]
    };
})();