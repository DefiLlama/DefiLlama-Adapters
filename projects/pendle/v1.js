const {
  sumTokensAndLPsSharedOwners,
  unwrapUniswapLPs
} = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const contracts = require("./contracts");
const { staking } = require("../helper/staking");

const ethTokens = contracts.v1.eth.tokens;
const ethFundedContracts = Object.keys(contracts.v1.eth.funded);
const ethStakingContracts = Object.keys(contracts.v1.eth.staking);
const ethOtTokens = Object.keys(contracts.v1.eth.otTokens);
const ethPool2Contracts = Object.keys(contracts.v1.eth.pool2);

const avaxTokens = contracts.v1.avax.tokens;
const avaxFundedContracts = Object.keys(contracts.v1.avax.funded);
const avaxOtTokens = Object.keys(contracts.v1.avax.otTokens);
const avaxPool2Contracts = Object.keys(contracts.v1.avax.pool2);

async function ethTvl(timestamp, block) {
  const balances = {};
  let lpBalances = [];
  const masterChefContract = "0xc2edad668740f1aa35e4d8f227fb8e17dca888cd";

  const masterChefDeposits = await sdk.api.abi.call({
    target: masterChefContract,
    abi: abi.userInfo,
    params: [1, ethFundedContracts[4]],
    block: block
  });
  lpBalances.push({
    token: ethTokens.SLP_ETHUSDC,
    balance: masterChefDeposits.output.amount
  });
  await unwrapUniswapLPs(balances, lpBalances, block);

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [ethTokens.USDC, false],
      [ethTokens.aUSDC, false],
      [ethTokens.cDAI, false],
      [ethTokens.SLP_ETHUSDC, false],
      [ethTokens.SLP_PENDLEETH, false],
      [ethTokens.SUSHI, false],
      [ethTokens.COMP, false],
      [ethTokens.wxBTRFLY, false],
      [ethTokens.SLP_OT_aUSDC_21, false],
      [ethTokens.SLP_OT_aUSDC_22, false],
      [ethTokens.SLP_OT_cDAI_21, false],
      [ethTokens.SLP_OT_cDAI_22, false],
      [ethTokens.SLP_OT_ETHUSDC_22, false],
      [ethTokens.SLP_OT_wxBTRFLY_22, false]
    ],
    ethFundedContracts,
    block
  );
  for (let token of ethOtTokens) {
    delete balances[token.toLowerCase()];
  }
  delete balances[ethTokens.PENDLE];

  return balances;
}

async function avaxTvl(timestamp, _, { avax: block }) {
  const transform = addr => 'avax:'+addr
  const balances = {};

  const masterChefContract = "0xd6a4F121CA35509aF06A0Be99093d08462f53052";
  const TIME = "avax:0xb54f16fb19478766a268f172c9480f8da1a7c9c3";

  balances[transform(avaxTokens.xJOE)] = (await sdk.api.abi.call({
    target: masterChefContract,
    abi: abi.userInfo,
    params: [24, avaxFundedContracts[0]],
    block: block,
    chain: "avax"
  })).output.amount;

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [avaxTokens.USDC, false],
      [avaxTokens.qiAVAX, false],
      [avaxTokens.qiUSDC, false],
      [avaxTokens.xJOE, false],
      [avaxTokens.JLP_PENDLEAVAX, false],
      [avaxTokens.WAVAX, false],
      [avaxTokens.JOE, false],
      [avaxTokens.QI, false],
      [avaxTokens.MIM, false],
      [avaxTokens.wMEMO, false],
      [avaxTokens.JLP_OT_PAP, false],
      [avaxTokens.JLP_OT_qiUSDC, false],
      [avaxTokens.JLP_OT_qiAVAX, false],
      [avaxTokens.JLP_OT_xJOE, false],
      [avaxTokens.JLP_OT_wMEMO, false]
    ],
    avaxFundedContracts,
    block,
    "avax",
    transform
  );

  balances[TIME] = (await sdk.api.abi.call({
    target: avaxTokens.wMEMO,
    abi: abi.wMEMOToMEMO,
    params: [balances[`avax:${avaxTokens.wMEMO}`]],
    block: block,
    chain: "avax"
  })).output;
  delete balances[`avax:${avaxTokens.wMEMO}`];

  for (let token of avaxOtTokens) {
    delete balances[`avax:${token.toLowerCase()}`];
  }

  return balances;
}
async function avaxPool2(timestamp, _, { avax: block }) {
  const transform = addr => 'avax:'+addr
  const pool2 = {};

  await sumTokensAndLPsSharedOwners(
    pool2,
    [
      [avaxTokens.JLP_PENDLEAVAX, false],
      [avaxTokens.PENDLE, false],
      [avaxTokens.JOE, false]
    ],
    avaxPool2Contracts,
    block,
    "avax",
    transform
  );

  return pool2;
}

module.exports = {
  ethereum: {
    pool2: staking(ethPool2Contracts, [ethTokens.SLP_PENDLEETH, ethTokens.PENDLE, ethTokens.SUSHI,]),
    tvl: ethTvl,
    staking: staking(ethStakingContracts, [ethTokens.PENDLE])
  },
  avax: {
    pool2: avaxPool2,
    tvl: avaxTvl
  },
  methodology:
    "V1 TVL counts the collateral backing the yield tokens and USDC in the pendle markets, plus staked OT liquidity, and SLP/JLP staked in masterchef. Staking TVL is just staked PENDLE on 0x07282F2CEEbD7a65451Fcd268b364300D9e6D7f5. Pool2 refers to the Pe,P pool on mainnet, and Pa,P pool on avax."
};
