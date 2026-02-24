const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require("@defillama/sdk");

const StakeContract = "0xD621813a8C1FA039A66DF647908053D1b4CE1428";

const ArbLUAUSD2CRV = "0xd2239b95890018a8f52ffd17d7f94c3a82f05389";
const Arb2CRV = "0x7f90122bf0700f9e7e1f688fe926940e8839f353";
const Arb2CRVOldGauge = "0xbF7E49483881C76487b0989CD7d9A8239B20CA41";

const Arb2CRVGauge = "0xCE5F24B7A95e9cBa7df4B54E911B4A3Dc8CDAf6f";
const Arb2CRVLUAUSDLP = "0xD2239B95890018a8f52fFD17d7F94C3A82f05389";
const ArbLUAUSDMetaPoolGauge = "0x721cac0f4715a29acd76752408636e8a49222c11";

const USDCBridged = ADDRESSES.arbitrum.USDC;
const USDT = ADDRESSES.arbitrum.USDT;
const WBTC = ADDRESSES.arbitrum.WBTC;
const LUA = "0xc3aBC47863524ced8DAf3ef98d74dd881E131C38";
const LUAUSD = "0x1DD6b5F9281c6B4f043c02A83a46c2772024636c";

const valuts = {
  // curve meta pool
  curveLUAUSDMetaPool: "0x12dc6b335f3d1f033F43F29E4ef4727643461755",

  // curve 2crv
  curve2CRV: "0xe9949A78006C23d7E2ba9843ea65f3dD7c7406da",

  // curve protocol revenue
  curveLUAUSDMetaPoolRevenue: "0x6Ac6cA54604B63d58B3e4BDb1488C340BbBDFE6c",

  // lua-luausd
  uniswapLUALUASD: "0x092dCc19bb3Ad1aF654bB1417Bc7b63991baCc01",

  // lua-usdt
  uniswapLUAUSDT: "0x749C02E48C96c0BA5f6aD15F26d9cEB270F4124D",

  // lua-wbtc
  uniswapLUABTC: "0xc9D8F9A68DaD55209B50EE19CbFEAb3B16d81372",
};

const staking = sumTokensExport({ ownerTokens: [[[Arb2CRVGauge, Arb2CRVLUAUSDLP, ArbLUAUSDMetaPoolGauge], StakeContract]] });

async function addUniswapPools(api, balances) {
  return sumTokens2({
    balances, api, owners: Object.values(valuts), tokens: [
      USDCBridged,
      USDT,
      WBTC,
    ],
    resolveUniV3: true,
    blacklistedTokens: [LUA, LUAUSD],
  });
}

async function addyLUAUSD2CRV(api, balances) {
  const metaPool2CRVBalance = await api.call({ abi: 'erc20:balanceOf', target: Arb2CRVOldGauge, params: ArbLUAUSD2CRV, })
  sdk.util.sumSingleBalance(balances, Arb2CRV, metaPool2CRVBalance, api.chain)
  return sumTokens2({ balances, api, owners: Object.values(valuts), tokens: [Arb2CRV, Arb2CRVGauge] })
}

const arb1Tvl = async (api) => {
  let balances = {};

  await Promise.all([
    addUniswapPools(api, balances),
    addyLUAUSD2CRV(api, balances),
  ])
  return balances
};

module.exports = {
  methodology: `We count the TVL on the protocol vaults`,
  arbitrum: {
    staking: staking,
    tvl: arb1Tvl,
  },
}