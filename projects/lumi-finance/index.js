const { sumTokensExport } = require('../helper/unwrapLPs')

const StakeContract = "0xD621813a8C1FA039A66DF647908053D1b4CE1428";

const Arb2CRVGauge = "0xCE5F24B7A95e9cBa7df4B54E911B4A3Dc8CDAf6f";
const Arb2CRVLUAUSDLP = "0xD2239B95890018a8f52fFD17d7F94C3A82f05389";
const ArbLUAUSDMetaPoolGauge = "0x721cac0f4715a29acd76752408636e8a49222c11";

const valuts = [
  // curve meta pool
  "0x12dc6b335f3d1f033F43F29E4ef4727643461755",
  // curve 2crv
  "0xe9949A78006C23d7E2ba9843ea65f3dD7c7406da",
  // curve 3crv
  "0x6Ac6cA54604B63d58B3e4BDb1488C340BbBDFE6c",
  // lua 1559
  "0xBBa7aB5D5f8b715A89aE28BE789A470D623d2E16",
  // lua-luausd
  "0x092dCc19bb3Ad1aF654bB1417Bc7b63991baCc01",
  // lua-usdt
  "0x749C02E48C96c0BA5f6aD15F26d9cEB270F4124D",
  // lua-wbtc
  "0xc9D8F9A68DaD55209B50EE19CbFEAb3B16d81372",
];

const staking = sumTokensExport({ ownerTokens: [[[Arb2CRVGauge, Arb2CRVLUAUSDLP, ArbLUAUSDMetaPoolGauge], StakeContract]] });

module.exports = {
  methodology: `We count the TVL on the protocol valuts`,
  arbitrum: {
    staking: staking,
    tvl: sumTokensExport({
      tokens: [
        Arb2CRVGauge,
        Arb2CRVLUAUSDLP,
        ArbLUAUSDMetaPoolGauge,
      ], 
      owners: valuts,
      resolveUniV3: true,
    }),
  }
}