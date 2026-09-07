export const STANDARD_PRODUCTS = [
    'OWealth', 'Targets', 'SafeBox', 'Spend & Save', 'Sub-account', 'Superbalance', 'Fixed', 'KA Fixed'
];

export const FIELD_NAMES = {
    product_code: '产品编码', name: '产品名称', category: '所属品类',
    fund_merchant_no: '资金商户号', tax_rate: '税率', tax_bearer: '税费承担方',
    product_protocol: '产品协议链接', status: '状态',
    item_code: '单品编码', item_name: '单品名称', interest_rate: '利率配置',
    alias: '对客别名', total_issuance_amount: '发行总规模', period_days: '持有期限',
    min_sub_amount: '起购金额', max_single_sub: '单笔上限', cum_sub_limit: '累计限额',
    sale_start_time: '申购开始日', sale_end_time: '申购截止日', rates: '利率配置',
    target_audience_id: '人群ID', is_unlimited_quota: '无限额模式'
};

export const STATUS_MAP = {
    'Active': '生效中', 'Draft': '草稿', 'Archived': '已归档'
};

// ==========================================
// 权限系统定义 (RBAC V2 Tree)
// ==========================================
export const PERMISSION_TREE = [
    {
        code: 'PRODUCT_MGMT', name: 'Saving产品管理',
        resources: [
            { code: 'L1_PRODUCT', name: '产品定义 (L1)', actions: [{k:'VIEW', n:'查看'}, {k:'EDIT', n:'编辑'}] },
            { code: 'L2_ITEM', name: '标准单品 (L2)', actions: [{k:'VIEW', n:'查看'}, {k:'EDIT', n:'编辑'}] }
        ]
    },
    {
        code: 'FIXED_OPS', name: 'Fixed业务管理',
        resources: [
            { 
                code: 'SPECIAL_PLAN', name: 'Fixed Special产品', 
                actions: [
                    {k:'VIEW', n:'查看'}, {k:'CREATE', n:'创建'}, {k:'EDIT', n:'编辑'}, {k:'PUBLISH', n:'上架'}, {k:'OFFSHELF', n:'下架'}
                ] 
            }
        ]
    },
    {
        code: 'KA_FIXED_OPS', name: 'KA Fixed业务管理',
        resources: [
            { 
                code: 'PLAN', name: 'KA Fixed单品', 
                actions: [
                    {k:'VIEW', n:'查看'}, {k:'CREATE', n:'创建'}, {k:'EDIT', n:'编辑'}, {k:'PUBLISH', n:'上架'}, {k:'OFFSHELF', n:'下架'}
                ] 
            }
        ]
    },
{
        code: 'TARGET_OPS', name: '功能管理',
        resources: [
            { code: 'TEMPLATE', name: 'Target场景模板', actions: [{k:'VIEW', n:'查看'}, {k:'EDIT', n:'编辑'}, {k:'CREATE', n:'创建'}] },
            { code: 'AC_RETENTION', name: 'AC转账挽留策略', actions: [{k:'VIEW', n:'查看'}, {k:'EDIT', n:'编辑'}, {k:'CREATE', n:'创建'}] },
            { code: 'KA_WHITELIST', name: 'KA Fixed白名单', actions: [{k:'VIEW', n:'查看'}, {k:'EDIT', n:'编辑'}, {k:'CREATE', n:'创建'}] },
            { code: 'TEXT_LINK', name: '资产页引导文案', actions: [{k:'VIEW', n:'查看'}, {k:'EDIT', n:'编辑'}, {k:'CREATE', n:'创建'}] }
        ]
    },
    {
        code: 'INSURANCE_MGMT', name: '保险产品管理',
        resources: [
            { code: 'PLAN', name: '保险产品', actions: [{k:'VIEW', n:'查看'}, {k:'CREATE', n:'创建'}, {k:'EDIT', n:'编辑'}] },
            { code: 'CATEGORY', name: '保险品类', actions: [{k:'VIEW', n:'查看'}, {k:'CREATE', n:'创建'}, {k:'EDIT', n:'编辑'}] },
            { code: 'COMPANY', name: '保险公司', actions: [{k:'VIEW', n:'查看'}, {k:'CREATE', n:'创建'}, {k:'EDIT', n:'编辑'}] }
        ]
    },
    {
        code: 'SYSTEM', name: '系统管理',
        resources: [
            { code: 'PARAMS', name: '系统参数', actions: [{k:'VIEW', n:'查看'}, {k:'EDIT', n:'编辑'}] },
            { code: 'USER', name: '用户管理', actions: [{k:'VIEW', n:'查看'}, {k:'EDIT', n:'编辑'}] },
            { code: 'RBAC', name: '权限配置', actions: [{k:'VIEW', n:'查看'}, {k:'EDIT', n:'编辑'}] }
        ]
    }
];

export function formatMoneyRaw(val) {
    if(val === undefined || val === null) return '0';
    return Number(val).toLocaleString();
}

export function formatMoney(val) {
    if(val === undefined || val === null) return '--';
    return '₦' + formatMoneyRaw(val);
}

export function formatRateDisplay(rateObj) {
    if (!rateObj) return '-';
    if (rateObj.type === 'flat') {
        return (rateObj.value * 100).toFixed(2) + '%';
    }
    if (rateObj.type === 'tiered' && Array.isArray(rateObj.rules)) {
        return rateObj.rules.map(r => {
            const rate = (r.rate * 100).toFixed(2) + '%';
            if (Number(r.min) === 0) {
                return rate;
            }
            const min = formatMoneyRaw(r.min);
            return `${rate} (≥${min})`;
        }).join(' | ');
    }
    return 'Complex Rate';
}

export function statusBadgeClass(status) {
    const map = {
        '生效中': 'bg-green-100 text-green-800 border-green-200',
        '草稿': 'bg-gray-100 text-gray-600 border-gray-200',
        '已归档': 'bg-gray-300 text-gray-700 border-gray-400'
    };
    return map[status] || 'bg-gray-100';
}

export function checkPermission(permStr, currentRoleCode, rolesList) {
    const currentRole = rolesList.find(r => r.code === currentRoleCode);
    if (!currentRole) return false;
    
    if (currentRole.permissions.includes('*')) return true;

    return currentRole.permissions.includes(permStr);
}