const { sumTokensExport } = require('../helper/unwrapLPs')

const AMMContract = "0x71E66919Fdc2e8687909c8dfe7A451dCf313A332";
const StakeContract = "0xD621813a8C1FA039A66DF647908053D1b4CE1428";
const Arb2CRVGauge = "0xCE5F24B7A95e9cBa7df4B54E911B4A3Dc8CDAf6f";
const Arb2CRVLUAUSDLP = "0xD2239B95890018a8f52fFD17d7F94C3A82f05389";

const staking = sumTokensExport({ ownerTokens: [[[Arb2CRVGauge, Arb2CRVLUAUSDLP], StakeContract]] });

module.exports = {
  methodology: `We count the 2CRV and 2CRVLUAUSD-LP on ${AMMContract}, ${StakeContract}`,
  arbitrum: {
    staking: staking,
    tvl: sumTokensExport({ ownerTokens: [[[Arb2CRVGauge, Arb2CRVLUAUSDLP], AMMContract]] })
  }
}