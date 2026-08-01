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

async function ethTvl(api) {
  const masterChefContract = "0xc2edad668740f1aa35e4d8f227fb8e17dca888cd";

  const masterChefDeposits = await api.call({
    target: masterChefContract,
    abi: abi.userInfo,
    params: [1, ethFundedContracts[4]],
  });
  api.add(ethTokens.SLP_ETHUSDC, masterChefDeposits.amount);
  await api.sumTokens({
    owners: ethFundedContracts, tokens: [
      ethTokens.USDC,
      ethTokens.aUSDC,
      ethTokens.cDAI,
      ethTokens.SLP_ETHUSDC,
      ethTokens.SLP_PENDLEETH,
      ethTokens.SUSHI,
      ethTokens.COMP,
      ethTokens.wxBTRFLY,
      ethTokens.SLP_OT_aUSDC_21,
      ethTokens.SLP_OT_aUSDC_22,
      ethTokens.SLP_OT_cDAI_21,
      ethTokens.SLP_OT_cDAI_22,
      ethTokens.SLP_OT_ETHUSDC_22,
      ethTokens.SLP_OT_wxBTRFLY_22,
    ]
  })

  ethOtTokens.push(ethTokens.PENDLE);

  ethOtTokens.map(i => api.removeTokenBalance(i))
  return api.getBalances()
}

async function avaxTvl(api) {
  const masterChefContract = "0xd6a4F121CA35509aF06A0Be99093d08462f53052";

  const xJOEBalance = (await api.call({
    target: masterChefContract,
    abi: abi.userInfo,
    params: [24, avaxFundedContracts[0]],
  })).amount
  api.add(avaxTokens.xJOE, xJOEBalance);
  await api.sumTokens({
    owners: avaxFundedContracts, tokens: [
      avaxTokens.USDC,
      avaxTokens.qiAVAX,
      avaxTokens.qiUSDC,
      avaxTokens.xJOE,
      avaxTokens.JLP_PENDLEAVAX,
      avaxTokens.WAVAX,
      avaxTokens.JOE,
      avaxTokens.QI,
      avaxTokens.MIM,
      avaxTokens.wMEMO,
      avaxTokens.JLP_OT_PAP,
      avaxTokens.JLP_OT_qiUSDC,
      avaxTokens.JLP_OT_qiAVAX,
      avaxTokens.JLP_OT_xJOE,
      avaxTokens.JLP_OT_wMEMO,
    ]
  })

  avaxOtTokens.map(i => api.removeTokenBalance(i))
  return api.getBalances()
}

async function avaxPool2(api) {
  await api.sumTokens({
    owners: avaxPool2Contracts, tokens: [
      avaxTokens.JLP_PENDLEAVAX,
      avaxTokens.PENDLE,
      avaxTokens.JOE,
    ]
  })
  return api.getBalances()
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
