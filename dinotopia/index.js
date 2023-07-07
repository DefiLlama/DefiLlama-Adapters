const Abis = require("./abi.json");
const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const Contracts = {
  bsc: {
    wbnb: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    brx: "0xe550c560a895d043E5EEd2bC7eC8A8e46c2408D6",
    fossil: "0xfE8FFB60a2B6d46102caa35739Be465E600D0f5E",
    bank: "0xF90c0b409001b97067c539693754008456f6C265",
    multiFeeDistribution: "0xd1f2467b2E2cb7bABc5CE8a947A294f216D93F90",
    chef: "0xF59e1568cb5FA1cdf1f4233D738D802A90c64B5E",
    lps: [
      "0x9bB50fE7E33C15405f94978A5bb88F8544847007", // FOSSIL_BNB_LP
      "0x5Ff686208DFe12D35761fe9C74396852303BC377", // BRX_BNB_LP
    ],
  },
};

async function calcBscTvl(timestamp, ethBlock, chainBlocks) {
  const bscBlock = chainBlocks.bsc;
  const bscChain = "bsc";

  const bscBankBalance = await sdk.api.abi.call({
    target: Contracts.bsc.bank,
    abi: Abis.bank.usableBnbBalance,
    chain: bscChain,
    block: bscBlock,
  });

  return {
    [`bsc:${Contracts.bsc.wbnb}`]:
      +bscBankBalance.output,
  };
}

async function calcBscStakingTvl(timestamp, ethBlock, chainBlocks) {
  const bscBlock = chainBlocks.bsc;
  const bscChain = "bsc";

  const bscStakingData = await sdk.api.abi.call({
    target: Contracts.bsc.multiFeeDistribution,
    abi: Abis.multiFeeDistribution.totalSupply,
    chain: bscChain,
    block: bscBlock,
  });

  return {
    [`bsc:${Contracts.bsc.fossil}`]: bscStakingData.output,
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

async function bscPool2(timestamp, block, chainBlocks) {
  const farm = await calcPool2(
    Contracts.bsc.chef,
    Contracts.bsc.lps,
    chainBlocks.bsc,
    "bsc"
  );
  return { ...farm };
}

module.exports = {
  bsc: {
    tvl: calcBscTvl,
    pool2: bscPool2,
    staking: calcBscStakingTvl,
  },
};