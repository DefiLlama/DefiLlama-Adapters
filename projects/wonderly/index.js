const ADDRESSES = require('../helper/coreAssets.json')
const Abis = require("./abi.json");
const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const Contracts = {
  fantom: {
    wftm: ADDRESSES.fantom.WFTM,
    gfx: "0xB6d8Ff34968e0712c56DE561b2f9Debd526a348c",
    bank: "0xeE5b6F97faaEB7f56Df1B433CC46d69e5659dF0B",
    multiFeeDistribution: "0x29f3e86280014d703BCaE532b6751fFa9Fca0df9",
    chef: "0x6646346DEe3cfb1C479a65009B9ed6DA47D41771",
    lps: [
      "0x63B560616CcCc218ade162bB580579f55c3320bb", // GFX_FTM_LP
      "0x8b74df2ffa35464cb6cb96888ff8eecae29f728f", // GFTM_FTM_LP
    ],
  },
  arbitrum: {
    weth: ADDRESSES.arbitrum.WETH,
    afx: "0x42972EdecD94BDD19A622A6a419bDDed2de56E08",
    bank: "0xd73509D1B57bD99121AB30040227d51d295C159e",
    multiFeeDistribution: "0x564DdF4206994FA0Ad0d11947095cA3dfcb905e2",
    chef: "0x952470bfA5326A31301396dF9c05ea774685562a",
    lps: [
      "0xa6bd5B143c2dEC9BDB7F1355AB0d6290B5B11608", // AFX_ETH_LP
      "0x0e4a0caEb84A9c2904704d02738d40a82BE3c8Cb", // XETH_ETH_LP
      "0x68a69ca6825B626DD627457f5915E111031496a4", // XETH_AFX_LP
    ],
  },
};

async function calcFantomTvl(timestamp, ethBlock, chainBlocks) {
  const fantomBlock = chainBlocks.fantom;
  const fantomChain = "fantom";

  const fantomBankBalance = await sdk.api.abi.call({
    target: Contracts.fantom.bank,
    abi: Abis.bank.usableFtmBalance,
    chain: fantomChain,
    block: fantomBlock,
  });

  return {
    [`fantom:${Contracts.fantom.wftm}`]:
      +fantomBankBalance.output,
  };
}

async function calcArbitrumTvl(timestamp, ethBlock, chainBlocks) {
  const arbitrumBlock = chainBlocks.arbitrum;
  const arbitrumChain = "arbitrum";

  const arbitrumBankBalance = await sdk.api.abi.call({
    target: Contracts.arbitrum.bank,
    abi: Abis.bank.usableEthBalance,
    chain: arbitrumChain,
    block: arbitrumBlock,
  });

  return {
    [`arbitrum:${Contracts.arbitrum.weth}`]:
      +arbitrumBankBalance.output
  };
}

async function calcFantomStakingTvl(timestamp, ethBlock, chainBlocks) {
  const fantomBlock = chainBlocks.fantom;
  const fantomChain = "fantom";

  const fantomStakingData = await sdk.api.abi.call({
    target: Contracts.fantom.multiFeeDistribution,
    abi: Abis.multiFeeDistribution.totalSupply,
    chain: fantomChain,
    block: fantomBlock,
  });

  return {
    [`fantom:${Contracts.fantom.gfx}`]: fantomStakingData.output,
  };
}

async function calcArbitrumStakingTvl(timestamp, ethBlock, chainBlocks) {
  const arbitrumBlock = chainBlocks.arbitrum;
  const arbitrumChain = "arbitrum";

  const arbitrumStakingData = await sdk.api.abi.call({
    target: Contracts.arbitrum.multiFeeDistribution,
    abi: Abis.multiFeeDistribution.totalSupply,
    chain: arbitrumChain,
    block: arbitrumBlock,
  });

  return {
    [`arbitrum:${Contracts.arbitrum.afx}`]: arbitrumStakingData.output,
  };
}

async function calcPool2(masterchef, lps, block, chain) {
  let balances = {};
  const lpBalances = (
    await sdk.api.abi.multiCall({
      calls: lps.map((p) => ({
        target: p,
        params: masterchef,
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;
  let lpPositions = [];
  lpBalances.forEach((p) => {
    lpPositions.push({
      balance: p.output,
      token: p.input.target,
    });
  });
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );
  return balances;
}

async function arbitrumPool2(timestamp, block, chainBlocks) {
  const farm = await calcPool2(
    Contracts.arbitrum.chef,
    Contracts.arbitrum.lps,
    chainBlocks.arbitrum,
    "arbitrum"
  );
  return { ...farm };
}

async function fantomPool2(timestamp, block, chainBlocks) {
  const farm = await calcPool2(
    Contracts.fantom.chef,
    Contracts.fantom.lps,
    chainBlocks.fantom,
    "fantom"
  );
  return { ...farm };
}

module.exports = {
  fantom: {
    tvl: calcFantomTvl,
    pool2: fantomPool2,
    staking: calcFantomStakingTvl,
  },
  arbitrum: {
    tvl: calcArbitrumTvl,
    pool2: arbitrumPool2,
    staking: calcArbitrumStakingTvl
  }
};

module.exports = {
  fantom: {
    tvl: () => ({}),
  },
  arbitrum: {
    tvl: () => ({}),
  },
  hallmarks: [
    [Math.floor(new Date('2023-02-15')/1e3), 'Project rugged'],
  ],
}