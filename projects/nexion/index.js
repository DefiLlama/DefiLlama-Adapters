const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");
const farmAbi = require("./farm-Abi.json");
const { sumTokensExport } = require("../helper/unknownTokens.js");

let contracts = {
  NEONStaking: "0x00149EF1A0a41083bC3996d026a7c0f32fc5cb73",
  NEON: "0xF2Da3942616880E52e841E5C504B5A9Fba23FFF0",
  gg: "0x8a9eAa66561B87645B14998aDc8aE0472C8B3AD4",
  NEONRaffle: "0x6DCDf944d96d107A25924CF4c4411e39cbC0bd59",
  NEONRaffleDistributor: "0x3CEf1D860cdDE93DCc51667ee5790eF513C5e8DC",
  NEONAuction: "0x9217A44143c3f0aad4Ec4F6771DB97580d3DdfF6",
  NEONVault: "0x8F37162a47aF42D8676e4f5D343a855264EB5591",
  NEONBuynBurn: "0xBd48026E337f1419EC97F780b2045eb0ef2E0467",
  NEONLPStaking: "0x08e9363DE98F0E2414b6DC7a1081c5a29964319e",
  NEONFarm: "0xdF6ec9b93fa473Cb6772dc47326338ecBa374D39",
  OLDNEONFarm: "0x80020303898695b3Ab8017869B6158B49cD5B6CC",
};

const COLLATERALS = {

    DAI: ADDRESSES.pulse.DAI,
    // PLS: nullAddress,
    WPLS: ADDRESSES.pulse.WPLS,
    DAIPLS_LP:"0xE56043671df55dE5CDf8459710433C10324DE0aE"

};

// async function tvl(api) {
//   return sumTokens2({
//     api,
//     owner: [contracts.NEONBuynBurn,contracts.NEONFarm,contracts.OLDNEONFarm],
//     tokens: Object.values(COLLATERALS[api.chain]),
//   });
// }


// const lps = ["0xE56043671df55dE5CDf8459710433C10324DE0aE"]

module.exports = {
  methodology: `BuynBurn holds PLS from user deposits. Farms hold PLS-DAI LP from user deposits`,
  pulse: {
    tvl :sumTokensExport({ owner: [contracts.NEONBuynBurn],tokens: [nullAddress]}),
     staking: sumTokensExport({
            owners:[contracts.NEONFarm,contracts.OLDNEONFarm],
            tokens: [COLLATERALS.DAI, COLLATERALS.WPLS],
            useDefaultCoreAssets: true,
            lps: [COLLATERALS.DAIPLS_LP],
          }),
  },
};
