# Chapool DefiLlama Adapter

## 项目简介

Chapool 是一个基于 opBNB 的 NFT 质押协议。本 adapter 用于向 DefiLlama 提交项目的 TVL 数据。

## 数据指标

- **TVL**: 按 NFT 等级分别计算质押价值，汇总总锁仓价值 ✅ 必需

> **注意**：Revenue 数据需要提交到另一个仓库 [`DefiLlama/dimension-adapters`](https://github.com/DefiLlama/dimension-adapters)，不是这个仓库。

## 数据源

使用 Dune Analytics 查询 opBNB 链上事件数据：
- NFT 质押/解质押事件（Staking 合约）- 用于 TVL 计算

## 快速开始

### 1. 配置环境变量

在项目根目录 `.env` 文件中添加：

```env
DUNE_API_KEY=your_dune_api_key
DUNE_QUERY_TVL=your_tvl_query_id
```

### 2. 在 Dune 创建查询

参考 [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) 中的 SQL 查询，在 Dune Analytics 创建相应查询。

### 3. 测试

```bash
node test.js projects/chapool/index.js
```

## 详细信息

详细的实现方案、查询 SQL 和配置说明请参考 [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)。

## 合约地址

- **CPNFT**: `0x2d3A1b0fD28D8358643b4822B475bF435F2611cb`
- **Staking**: `0xD8d733e352887185ea8Cb60e5173a3c68B69Fc37`
- **Payment**: `0xEe83640f0ed07d36E799531CC6d87FB4CDcCaC13`
- **网络**: opBNB
- **起始区块**: 92328871

