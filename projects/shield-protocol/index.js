const ADDRESSES = require('../helper/coreAssets.json')
const Abis = require("./abi.json");
const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const { sumTokensExport, nullAddress, } = require('../helper/unknownTokens')
 
const Contracts = { 
  bsc: {
    wbnb: ADDRESSES.bsc.WBNB,
    shield: "0xD9E90DF21F4229249E8841580cDE7048bF935710",
    bank: "0xcc40896e6d0C8Dd93Bd9DFaF11118B338015EcD4",
    multiFeeDistribution: "0x36D7fa1C701aAA811F8736C40435C50Bb77BF843",
    chef: "0xd8d4bf1bcB9Db777188A20Ee458e9F560092644c",
    lps: [
      "0xA976a4ba5076f1264e0f8fFB5b9ff4aC9Fd615fa",  // SHIELD_BNB_LP
      "0xb5A343D746be5942B37e222678979F124ecE8f68",  // BNBX_BNB LP 
    ],
  },
};

async function calcTvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.bsc;
  const chain = "bsc";

  const bankBalance = await sdk.api.abi.call({
    target: Contracts.bsc.bank,
    abi: Abis.bank.usableCollateralBalance,
    chain: chain,
    block,
  });

  return {
    [`bsc:${Contracts.bsc.wbnb}`]:
      +bankBalance.output,
  };
}

async function calcStakingTvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.bsc;
  const chain = "bsc";

  const stakingData = await sdk.api.abi.call({
    target: Contracts.bsc.multiFeeDistribution,
    abi: Abis.multiFeeDistribution.totalSupply,
    chain: chain,
    block,
  });


  return {
    [`bsc:${Contracts.bsc.shield}`]: stakingData.output,
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
    tvl: calcTvl,
    pool2: sumTokensExport({ owner: Contracts.bsc.chef, tokens: Contracts.bsc.lps, useDefaultCoreAssets: true, lps: Contracts.bsc.lps}),
    staking: calcStakingTvl,
  },
};
