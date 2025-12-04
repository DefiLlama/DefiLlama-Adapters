# Chapool DefiLlama Adapter 实现方案

## 📋 项目概述

本文档说明如何使用 Dune Analytics 为 Chapool NFT 质押项目开发 DefiLlama Adapter。

## 🎯 需要实现的数据指标

### ⚠️ 重要说明

根据 DefiLlama 的标准要求：

- **TVL 适配器**（本仓库 `DefiLlama-Adapters`）：只需实现 **TVL** 指标
- **Revenue 适配器**（另一个仓库 `DefiLlama/dimension-adapters`）：Revenue 数据需要提交到 [DefiLlama/dimension-adapters](https://github.com/DefiLlama/dimension-adapters) 仓库，不是这个仓库

根据 [DefiLlama PR 模板](https://github.com/DefiLlama/DefiLlama-Adapters/blob/main/pull_request_template.md)：
> If you would like to add a `volume/fees/revenue` adapter please submit the PR [here](https://github.com/DefiLlama/dimension-adapters).

### 1. 总锁仓价值（TVL - Total Value Locked）✅ 必需

#### 数据含义
TVL 表示用户在平台上锁定的资产总价值。对于 NFT 质押项目，TVL 等于所有已质押 NFT 的总价值。

#### 计算方法
**按等级分别计算（推荐）**

```
TVL = Σ(每个等级的质押数量 × 该等级 NFT 的价格 × ETH 价格)
```

#### NFT 等级价格设定（ETH）

根据文档，按等级设定固定价格：

| 等级 | 名称 | 价格 (ETH) |
|------|------|-----------|
| 1 | C | 0.05 |
| 2 | B | 0.1 |
| 3 | A | 0.2 |
| 4 | S | 0.5 |
| 5 | SS | 1.0 |
| 6 | SSS | 2.0 |

#### 计算步骤
1. 查询每个等级的质押数量（从 StakingActivity 事件）
2. 获取每个等级对应的 NFT 价格
3. 获取 ETH/USD 价格
4. 计算每个等级的 TVL = 质押数量 × NFT 价格 × ETH 价格
5. 汇总所有等级的 TVL

---

### 2. 协议收入（Revenue）❌ 不在本仓库

#### ⚠️ 注意
**Revenue 适配器需要提交到另一个仓库：`DefiLlama/dimension-adapters`**

根据 [DefiLlama PR 模板](https://github.com/DefiLlama/DefiLlama-Adapters/blob/main/pull_request_template.md)：
> If you would like to add a `volume/fees/revenue` adapter please submit the PR [here](https://github.com/DefiLlama/dimension-adapters).

#### 数据含义（供参考）
协议收入是指用户向平台支付的费用总额，不包括退款。这是平台实际获得的收入。

#### 计算方法（供参考）
```
协议净收入 = 总支付金额 - 总退款金额
```

#### 计算步骤（供参考）
1. 查询 PaymentMade 事件，汇总所有支付金额
2. 查询 RefundProcessed 事件，汇总所有退款金额
3. 净收入 = 支付总额 - 退款总额
4. 转换为 USD

---

### 3. 每日收入（Daily Revenue）❌ 不在本仓库

#### ⚠️ 注意
**每日收入属于 Revenue 指标，同样需要提交到 `DefiLlama/dimension-adapters` 仓库**

#### 数据含义（供参考）
每日收入是指协议每天获得的收入金额，用于展示收入趋势。

#### 计算方法（供参考）
```
每日收入 = 该日所有支付金额的总和 - 该日所有退款金额的总和
```

---

### 4. 其他指标 ❌ 不需要

根据项目特性，以下指标**不需要**实现：

| 指标 | 是否实现 | 原因 |
|------|---------|------|
| **Staking** | ❌ 否 | 项目没有原生代币质押机制 |
| **Pool2** | ❌ 否 | 项目没有 LP 代币质押 |
| **Borrowed** | ❌ 否 | 这是 NFT 质押协议，不是借贷协议 |

---

## 🔗 合约地址信息（opBNB）

根据项目部署信息：

- **CPNFT 合约**：`0x2d3A1b0fD28D8358643b4822B475bF435F2611cb`
- **Staking 合约**：`0xD8d733e352887185ea8Cb60e5173a3c68B69Fc37`
- **Payment 合约**：`0xEe83640f0ed07d36E799531CC6d87FB4CDcCaC13`
- **网络**：opBNB
- **起始区块**：`92328871`

---

## 📊 Dune Analytics 查询方案

### 事件签名

以下事件签名已在文档中计算：

1. **Transfer 事件**（ERC721）：
   - `0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef`

2. **NFTStaked 事件**：
   - `0xb7f42a117a7de13499e08cdb12729b20c510b7f623fc79fec9e8bfbe1a024487`
   - 参数：`(address indexed user, uint256 indexed tokenId, uint8 level, uint256 timestamp)`

3. **NFTUnstaked 事件**：
   - `0x84bcc89bc1b3cb66a2b22a282fa6e1bb013db80ebce0e9c70f9beba416ac2b70`
   - 参数：`(address indexed user, uint256 indexed tokenId, uint256 stakingDuration, uint256 rewards)`

4. **PaymentMade 事件**（Revenue 适配器使用）：
   - `0x32aced27dfd49efcd31ceb0567a1ef533d2ab1481334c3f316047bf16fe1c8e8`
   - 参数：`(uint256 indexed paymentId, address indexed payer, address indexed recipient, uint256 amount, uint256 timestamp)`

5. **RefundProcessed 事件**（Revenue 适配器使用）：
   - `0x4d60a9438ba7e18c1fed7577dc8932bfe82f683c1e254a5336b6618ab5301641`
   - 参数：`(uint256 indexed paymentId, address indexed payer, address indexed recipient, uint256 amount)`

---

### 查询 1：TVL 查询（按等级统计质押数量）✅ 必需

> **用途**：本 TVL 适配器使用

#### Dune Query SQL

```sql
-- 按等级查询质押数量（用于计算 TVL）
WITH staking_events AS (
    -- 质押事件
    SELECT 
        varbinary_to_uint256(topic3) as token_id,
        CAST(varbinary_to_uint256(bytearray_substring(data, 1, 32)) AS INTEGER) as level,
        'STAKE' as action,
        block_time,
        block_number
    FROM opbnb.logs
    WHERE 
        contract_address = 0xD8d733e352887185ea8Cb60e5173a3c68B69Fc37
        AND topic0 = 0xb7f42a117a7de13499e08cdb12729b20c510b7f623fc79fec9e8bfbe1a024487
        AND block_number >= 92328871
    
    UNION ALL
    
    -- 解质押事件
    SELECT 
        varbinary_to_uint256(topic3) as token_id,
        NULL as level,
        'UNSTAKE' as action,
        block_time,
        block_number
    FROM opbnb.logs
    WHERE 
        contract_address = 0xD8d733e352887185ea8Cb60e5173a3c68B69Fc37
        AND topic0 = 0x84bcc89bc1b3cb66a2b22a282fa6e1bb013db80ebce0e9c70f9beba416ac2b70
        AND block_number >= 92328871
),
current_staked AS (
    SELECT 
        token_id,
        MAX(level) as level,  -- 获取最新质押时的 level
        SUM(CASE WHEN action = 'STAKE' THEN 1 ELSE -1 END) as net_staked
    FROM (
        SELECT 
            token_id,
            level,
            action,
            ROW_NUMBER() OVER (PARTITION BY token_id ORDER BY block_number DESC) as rn
        FROM staking_events
    ) ranked
    WHERE rn = 1 OR action = 'UNSTAKE'
    GROUP BY token_id
    HAVING SUM(CASE WHEN action = 'STAKE' THEN 1 ELSE -1 END) > 0
),
staked_by_level AS (
    SELECT 
        level,
        COUNT(*) as staked_count
    FROM current_staked
    WHERE level IS NOT NULL
    GROUP BY level
)
SELECT 
    level,
    CASE level
        WHEN 1 THEN 'C'
        WHEN 2 THEN 'B'
        WHEN 3 THEN 'A'
        WHEN 4 THEN 'S'
        WHEN 5 THEN 'SS'
        WHEN 6 THEN 'SSS'
    END as level_name,
    staked_count
FROM staked_by_level
ORDER BY level
```

#### 查询返回格式

```json
[
  { "level": 1, "level_name": "C", "staked_count": 100 },
  { "level": 2, "level_name": "B", "staked_count": 50 },
  ...
]
```

---

### 查询 2：Revenue 查询（协议总收入）📝 供 Revenue 适配器参考

> **注意**：此查询用于 Revenue 适配器，在 `DefiLlama/dimension-adapters` 仓库中使用

#### Dune Query SQL

```sql
-- 查询 Payment 合约的总收入和净收入
WITH payments AS (
    SELECT 
        SUM(varbinary_to_uint256(bytearray_substring(data, 65, 32))) as total_volume
    FROM opbnb.logs
    WHERE 
        contract_address = 0xEe83640f0ed07d36E799531CC6d87FB4CDcCaC13
        AND topic0 = 0x32aced27dfd49efcd31ceb0567a1ef533d2ab1481334c3f316047bf16fe1c8e8
        AND block_number >= 92328871
),
refunds AS (
    SELECT 
        SUM(varbinary_to_uint256(bytearray_substring(data, 65, 32))) as total_refund_volume
    FROM opbnb.logs
    WHERE 
        contract_address = 0xEe83640f0ed07d36E799531CC6d87FB4CDcCaC13
        AND topic0 = 0x4d60a9438ba7e18c1fed7577dc8932bfe82f683c1e254a5336b6618ab5301641
        AND block_number >= 92328871
),
eth_price AS (
    SELECT price
    FROM prices.usd
    WHERE symbol = 'ETH'
    AND blockchain = 'opbnb'
    ORDER BY minute DESC
    LIMIT 1
)
SELECT 
    COALESCE(p.total_volume, 0) / 1e18 as total_volume_eth,
    COALESCE(r.total_refund_volume, 0) / 1e18 as total_refund_volume_eth,
    (COALESCE(p.total_volume, 0) - COALESCE(r.total_refund_volume, 0)) / 1e18 as net_revenue_eth,
    (COALESCE(p.total_volume, 0) - COALESCE(r.total_refund_volume, 0)) / 1e18 * COALESCE(ep.price, 2500) as net_revenue_usd
FROM payments p
CROSS JOIN refunds r
CROSS JOIN eth_price ep
```

#### 查询返回格式

```json
[
  {
    "total_volume_eth": 100.5,
    "total_refund_volume_eth": 5.2,
    "net_revenue_eth": 95.3,
    "net_revenue_usd": 238250.0
  }
]
```

---

### 查询 3：每日收入查询（可选）📝 供 Revenue 适配器参考

> **注意**：此查询用于 Revenue 适配器，在 `DefiLlama/dimension-adapters` 仓库中使用

#### Dune Query SQL

```sql
-- 按日期统计每日收入
WITH daily_payments AS (
    SELECT 
        DATE(block_time) as payment_date,
        SUM(varbinary_to_uint256(bytearray_substring(data, 65, 32))) as daily_volume
    FROM opbnb.logs
    WHERE 
        contract_address = 0xEe83640f0ed07d36E799531CC6d87FB4CDcCaC13
        AND topic0 = 0x32aced27dfd49efcd31ceb0567a1ef533d2ab1481334c3f316047bf16fe1c8e8
        AND block_number >= 92328871
    GROUP BY DATE(block_time)
),
daily_refunds AS (
    SELECT 
        DATE(block_time) as refund_date,
        SUM(varbinary_to_uint256(bytearray_substring(data, 65, 32))) as daily_refund_volume
    FROM opbnb.logs
    WHERE 
        contract_address = 0xEe83640f0ed07d36E799531CC6d87FB4CDcCaC13
        AND topic0 = 0x4d60a9438ba7e18c1fed7577dc8932bfe82f683c1e254a5336b6618ab5301641
        AND block_number >= 92328871
    GROUP BY DATE(block_time)
),
eth_price AS (
    SELECT price
    FROM prices.usd
    WHERE symbol = 'ETH'
    AND blockchain = 'opbnb'
    ORDER BY minute DESC
    LIMIT 1
)
SELECT 
    COALESCE(dp.payment_date, dr.refund_date) as date,
    COALESCE(dp.daily_volume, 0) / 1e18 as daily_volume_eth,
    COALESCE(dr.daily_refund_volume, 0) / 1e18 as daily_refund_volume_eth,
    (COALESCE(dp.daily_volume, 0) - COALESCE(dr.daily_refund_volume, 0)) / 1e18 as daily_net_revenue_eth,
    (COALESCE(dp.daily_volume, 0) - COALESCE(dr.daily_refund_volume, 0)) / 1e18 * COALESCE(ep.price, 2500) as daily_net_revenue_usd
FROM daily_payments dp
FULL OUTER JOIN daily_refunds dr ON dp.payment_date = dr.refund_date
CROSS JOIN eth_price ep
ORDER BY date DESC
```

---

## 💻 Adapter 代码结构

### 文件位置
```
projects/chapool/
├── index.js              # 主 adapter 文件（只实现 TVL）
├── IMPLEMENTATION_PLAN.md # 本方案文档
└── README.md            # 项目说明（可选）
```

### 主要功能模块

1. **Dune API 客户端**
   - 使用 Dune API 获取查询结果
   - 处理查询状态（pending/executing/completed）
   - 错误处理和重试机制

2. **TVL 计算**
   - 从 Dune 查询获取按等级的质押数量
   - 计算每个等级的 TVL
   - 汇总总 TVL 并转换为 USD

3. **缓存机制**
   - 使用 `getConfig` 缓存查询结果
   - 避免频繁调用 Dune API
   - 支持时间戳缓存

### Module.exports 结构

```javascript
module.exports = {
  timetravel: false,
  methodology: `TVL is calculated by summing up staked NFT values by level...`,
  op_bnb: {
    tvl,  // 只需要实现 tvl，不需要 staking, pool2, borrowed 等
  },
};
```

---

## ⚙️ 配置步骤

### 1. 创建 Dune 查询（TVL 查询）

1. 访问 [Dune Analytics](https://dune.com)
2. 登录账号并创建新查询
3. 复制 **查询 1：TVL 查询** 的 SQL
4. 执行查询并获取 Query ID
5. 将查询设置为 Public 或使用 API Key 访问

> **注意**：Revenue 相关查询（查询 2 和查询 3）在 Revenue 适配器中配置

### 2. 获取 Dune API Key

1. 访问 Dune API 设置页面
2. 创建新的 API Key
3. 保存 API Key 用于配置

### 3. 配置环境变量

在项目根目录创建或更新 `.env` 文件：

```env
# TVL 适配器需要的配置
DUNE_API_KEY=your_dune_api_key_here
DUNE_QUERY_TVL=your_tvl_query_id

# Revenue 适配器配置（在另一个仓库使用）
# DUNE_QUERY_REVENUE=your_revenue_query_id
# DUNE_QUERY_DAILY_REVENUE=your_daily_revenue_query_id
```

### 4. 配置 Query Parameters（如需要）

如果查询需要参数（如日期范围），可以在代码中动态传递：

```javascript
// 示例：传递参数
const url = `${DUNE_API_BASE}/query/${queryId}/results?parameters.param1=value1`;
```

---

## 🧪 测试步骤

### 1. 本地测试

```bash
# 测试 TVL 计算
node test.js projects/chapool/index.js

# 测试指定时间点
node test.js projects/chapool/index.js 1729080692

# 测试指定日期
node test.js projects/chapool/index.js 2024-10-16
```

### 2. 验证数据

- 检查 TVL 是否按预期计算
- 确认价格转换准确
- 检查缓存是否正常工作

### 3. 错误处理测试

- 测试 Dune API 不可用的情况
- 测试查询返回空结果的情况
- 测试网络超时情况

---

## 📝 注意事项

### 1. Dune API 限制

- API 有调用频率限制
- 使用缓存减少 API 调用
- 查询执行可能需要时间，需要处理异步等待

### 2. 数据准确性

- 确保事件签名正确
- 验证数据解码正确（特别是 uint256 类型）
- 检查起始区块号是否正确

### 3. 价格获取

- ETH 价格可以从 Dune 的 prices.usd 表获取
- 也可以使用 DefiLlama SDK 的价格 API
- 建议使用多个价格源作为备用

### 4. 缓存策略

- TVL 数据可以缓存较长时间（如 5-10 分钟）
- 使用时间戳作为缓存 key 的一部分

### 5. 错误处理

- 实现重试机制
- 提供有意义的错误信息
- 考虑实现备用数据源（如直接查询链上）

---

## 🔄 后续优化

### 1. 性能优化

- 优化 Dune 查询性能
- 实现查询结果预缓存
- 批量获取多个指标

### 2. 数据源备份

- 实现备用数据源（The Graph Subgraph）
- 支持直接链上查询
- 多数据源对比验证

### 3. 功能扩展

- 支持历史数据查询
- 优化查询性能

---

## 📝 数据汇总

### 本仓库（DefiLlama-Adapters）需要实现

| 指标 | 状态 | 数据来源 | 用途 |
|------|------|---------|------|
| **TVL** | ✅ 必需 | Dune 查询 Staking 事件 | 展示平台规模 |

### 另一个仓库（DefiLlama/dimension-adapters）需要实现

| 指标 | 状态 | 数据来源 | 用途 |
|------|------|---------|------|
| **Revenue** | 📝 可选 | Dune 查询 Payment 事件 | 展示协议盈利能力 |
| **Daily Revenue** | 📝 可选 | Dune 查询 Payment 事件 | 展示收入趋势 |

### 不需要实现的指标

| 指标 | 原因 |
|------|------|
| Staking | 没有原生代币质押 |
| Pool2 | 没有 LP 代币质押 |
| Borrowed | 不是借贷协议 |

---

## 📚 参考资料

- [DefiLlama Adapter 指南](https://docs.llama.fi/submit-a-project)
- [DefiLlama Revenue Adapter 仓库](https://github.com/DefiLlama/dimension-adapters)
- [Dune API 文档](https://docs.dune.com/api-reference)
- [项目数据需求文档](../../../nft-staking-subgraph/DefiLiama需要的数据以及计算方法%20v1.0.md)

---

**最后更新**：2025-01-27

