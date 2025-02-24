const { sumTokens2 } = require('../helper/unwrapLPs');

const contracts = {
  stakingPools: {
    ethereum: "0xF2f8D915a4F28Cdb52cbe8F56ecc0f8AE3def54A",
    base: "0x21890f88fc8A8b0142025935415017adA358C8C0",
  },
  marketPool: {
    base: "0xecc312CBDC0884C41FE1579ea33686DdAcc90c42",
  },
  liquidityPools: {
    uniswapV3: "0x6A888fB73f13104473a4BdFb1bEb220aC1eAFda3",
    aerodrome: "0xC90E88d30b99442B6994915F3b146cE3D55982D9",
  },
  bridgeAdapter: "0xE6C2B672B3eB64A1F460AdcD9676a3B6c67abD4D",
};

const tokens = {
  ethereum: {
    MAVIA: "0x24fcFC492C1393274B6bcd568ac9e225BEc93584",
    WETH: "0xC02aaa39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  base: {
    MAVIA: "0x24fcFC492C1393274B6bcd568ac9e225BEc93584",
    WETH: "0x4200000000000000000000000000000000000006",
  },
};

async function tvlEthereum(_, _block, chainBlocks) {
  let balances = {};

  // Fetch TVL from Staking Pools
  await sumTokens2({
    balances,
    tokens: [tokens.ethereum.MAVIA],
    owners: [contracts.stakingPools.ethereum],
    chain: "ethereum",
    block: chainBlocks["ethereum"],
  });

  // Fetch TVL from Bridge Adapter (LayerZero Bridge)
  await sumTokens2({
    balances,
    tokens: [tokens.ethereum.MAVIA],
    owners: [contracts.bridgeAdapter],
    chain: "ethereum",
    block: chainBlocks["ethereum"],
  });

  // Fetch TVL from Liquidity Pools
  await sumTokens2({
    balances,
    tokens: [tokens.ethereum.MAVIA, tokens.ethereum.WETH],
    owners: [contracts.liquidityPools.uniswapV3],
    chain: "ethereum",
    block: chainBlocks["ethereum"],
  });

  return balances;
}

async function tvlBase(_, _block, chainBlocks) {
  let balances = {};

  // Fetch TVL from Staking Pools
  await sumTokens2({
    balances,
    tokens: [tokens.base.MAVIA],
    owners: [contracts.stakingPools.base],
    chain: "base",
    block: chainBlocks["base"],
  });

  // Fetch TVL from Market Pool on Base
  await sumTokens2({
    balances,
    tokens: [tokens.base.MAVIA],
    owners: [contracts.marketPool.base],
    chain: "base",
    block: chainBlocks["base"],
  });

  // Fetch TVL from Liquidity Pools
  await sumTokens2({
    balances,
    tokens: [tokens.base.MAVIA, tokens.base.WETH],
    owners: [contracts.liquidityPools.aerodrome],
    chain: "base",
    block: chainBlocks["base"],
  });

  return balances;
}

module.exports = {
  methodology: "Total TVL includes assets in Mavia market pools, staking pools, liquidity pools, and bridges.",
  ethereum: {
    tvl: tvlEthereum,
  },
  base: {
    tvl: tvlBase,
  },
};