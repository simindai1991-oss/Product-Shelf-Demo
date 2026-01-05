// config.js - 基于 productConfigV1.xlsx 生成
window.OPAY_FINANCE_CONFIG = {
    // ==========================================
    // 1. 权限与角色 (RBAC)
    // ==========================================
    roles_definition: {
        SUPER_ADMIN: { code: 'SUPER_ADMIN', name: 'Super Admin', permissions: ['view', 'edit', 'add', 'audit', 'user_manage'] },
        PRODUCT_ADMIN: { code: 'PRODUCT_ADMIN', name: 'Product Manager', permissions: ['view', 'edit', 'add', 'audit'] },
        USER: { code: 'USER', name: 'General User', permissions: ['view'] }
    },

    // 模拟用户库
    users: [
        { id: 1, name: 'Admin User', role: 'Super Admin' },
        { id: 2, name: 'Product Lead', role: 'Product Manager' },
        { id: 3, name: 'Viewer', role: 'General User' }
    ],

    // ==========================================
    // 2. 产品品类定义 (来自 Source 1)
    // ==========================================
    // 逻辑：只有 'Fixed' 的 singleton 为 false (允许新增)，其他均为 true
    categories: [
        { code: 'OWealth', name: 'OWealth', singleton: true, type: '156', is_lock: false, method: '复利', payout: 'T+1日凌晨结算' },
        { code: 'Targets', name: 'Targets', singleton: true, type: '156', is_lock: true, method: '单利', payout: '赎回时还本付息' },
        { code: 'SafeBox', name: 'SafeBox', singleton: true, type: '156', is_lock: true, method: '复利', payout: '每月1日发放' },
        { code: 'Fixed', name: 'Fixed', singleton: false, type: '156', is_lock: true, method: '单利', payout: '赎回时还本付息' }, // 允许新增
        { code: 'Spend & Save', name: 'Spend & Save', singleton: true, type: '156', is_lock: false, method: '复利', payout: 'T+1日凌晨结算' },
        { code: 'Sub-account', name: 'Sub-account', singleton: true, type: '156', is_lock: false, method: '复利', payout: 'T+1日凌晨结算' },
        { code: 'Superbalance', name: 'Superbalance', singleton: true, type: '256', is_lock: false, method: '复利', payout: 'T+1日凌晨结算' }
    ],

    // ==========================================
    // 3. 产品实例 (来自 Source 2)
    // ==========================================
    // 状态映射：开放中->Active, 已上架待开放->Approved
    products: [
        {
            product_code: 'OWealth', category_code: 'OWealth', name: 'OWealth', alias: 'OWealth', status: 'Active',
            is_tiered_rate: true,
            rates: [{rate: 0.15, stepMinAmount: 0}, {rate: 0.05, stepMinAmount: 10000000}],
            sub_start_date: '2000-01-01', sub_end_date: '2099-12-31',
            min_sub_amount: 0.01, min_redemption: 0.01, std_redemption_fee: 0, early_redemption_fee: 0,
            config_json: ''
        },
        {
            product_code: 'Targets', category_code: 'Targets', name: 'Targets', alias: 'Targets', status: 'Active',
            is_tiered_rate: true,
            rates: [{rate: 0.15, stepMinAmount: 0}, {rate: 0.06, stepMinAmount: 30000000}],
            sub_start_date: '2000-01-01', sub_end_date: '2099-12-31',
            min_sub_amount: 0.01, min_redemption: 0.01, std_redemption_fee: 0, early_redemption_fee: 0.01,
            config_json: ''
        },
        {
            product_code: 'SafeBox', category_code: 'SafeBox', name: 'SafeBox', alias: 'SafeBox', status: 'Active',
            is_tiered_rate: true,
            rates: [{rate: 0.15, stepMinAmount: 0}, {rate: 0.06, stepMinAmount: 30000000}],
            sub_start_date: '2000-01-01', sub_end_date: '2099-12-31',
            min_sub_amount: 0.01, min_redemption: 0.01, std_redemption_fee: 0, early_redemption_fee: 0.025,
            config_json: ''
        },
        {
            product_code: 'Spend & Save', category_code: 'Spend & Save', name: 'Spend & Save', alias: 'Spend & Save', status: 'Active',
            is_tiered_rate: true,
            rates: [{rate: 0.15, stepMinAmount: 0}, {rate: 0.05, stepMinAmount: 10000000}],
            sub_start_date: '2000-01-01', sub_end_date: '2099-12-31',
            min_sub_amount: 0.01, min_redemption: 0.01, std_redemption_fee: 0, early_redemption_fee: 0,
            config_json: ''
        },
        {
            product_code: 'Sub-account', category_code: 'Sub-account', name: 'Sub-account', alias: 'Sub-account', status: 'Active',
            is_tiered_rate: true,
            rates: [{rate: 0.15, stepMinAmount: 0}, {rate: 0.05, stepMinAmount: 10000000}],
            sub_start_date: '2000-01-01', sub_end_date: '2099-12-31',
            min_sub_amount: 0.01, min_redemption: 0.01, std_redemption_fee: 0, early_redemption_fee: 0,
            config_json: ''
        },
        {
            product_code: 'Superbalance', category_code: 'Superbalance', name: 'Superbalance', alias: 'Superbalance', status: 'Active',
            is_tiered_rate: false,
            rates: [{rate: 0.05, stepMinAmount: 0}],
            sub_start_date: '2000-01-01', sub_end_date: '2099-12-31',
            min_sub_amount: 0.01, min_redemption: 0.01, std_redemption_fee: 0, early_redemption_fee: 0,
            config_json: ''
        },
        // Fixed Products (多实例)
        {
            product_code: 'Fixed_100401', category_code: 'Fixed', name: 'Fixed', alias: 'Fixed', status: 'Active',
            is_tiered_rate: true,
            rates: [{rate: 0.15, stepMinAmount: 0}, {rate: 0.06, stepMinAmount: 30000000}],
            sub_start_date: '2000-01-01', sub_end_date: '2099-12-31',
            min_sub_amount: 1000, min_redemption: 0.01, std_redemption_fee: 0, early_redemption_fee: 0,
            config_json: ''
        },
        {
            product_code: 'Fixed_100402', category_code: 'Fixed', name: 'Fixed', alias: 'Fixed', status: 'Active',
            is_tiered_rate: true,
            rates: [{rate: 0.16, stepMinAmount: 0}, {rate: 0.07, stepMinAmount: 30000000}],
            sub_start_date: '2000-01-01', sub_end_date: '2099-12-31',
            min_sub_amount: 1000, min_redemption: 0.01, std_redemption_fee: 0, early_redemption_fee: 0,
            config_json: ''
        },
        // 特殊产品 Fixed_1005 (已上架待开放 -> Approved)
        {
            product_code: 'Fixed_1005', category_code: 'Fixed', name: 'Fixed_Special_test01', alias: 'Fixed_Special_test01', status: 'Approved',
            is_tiered_rate: false,
            rates: [{rate: 0.15, stepMinAmount: 0}, {rate: 0.06, stepMinAmount: 30000000}],
            sub_start_date: '2026-01-10', sub_end_date: '2026-01-31',
            min_sub_amount: 1000, max_single_sub: 300000, cum_sub_limit: 300000, issue_size: 1000000000,
            min_redemption: 0.01, std_redemption_fee: 0, early_redemption_fee: 0,
            target_audience_id: '1312',
            config_json: '{"is_fixed_special":1,"benchmark_rate": 0.15}'
        }
    ],

    // ==========================================
    // 4. 系统参数
    // ==========================================
    system_params: [
        { key: 'GLOBAL_RISK_RATE', value: '0.12', desc: '全局风控利率基准' },
        { key: 'APPROVAL_FLOW_ID', value: 'FS_8832_OPAY', desc: '飞书审批流定义ID' }
    ]
};