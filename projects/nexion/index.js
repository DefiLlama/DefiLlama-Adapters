const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unknownTokens.js");
const { aaveChainTvl } = require("../helper/aave");


// Nexion protocol addresses
let contracts = {
  NEONStaking: "0x00149EF1A0a41083bC3996d026a7c0f32fc5cb73",
  NEON: "0xF2Da3942616880E52e841E5C504B5A9Fba23FFF0",
  gg: "0x8a9eAa66561B87645B14998aDc8AE0472C8B3AD4",
  NEONRaffle: "0x6DCDf944d96d107A25924CF4c4411e39cbC0bd59",
  NEONRaffleDistributor: "0x3CEf1D860cdDE93DCc51667ee5790eF513C5e8DC",
  NEONAuction: "0x9217A44143c3f0aad4Ec4F6771DB97580d3DdfF6",
  NEONVault: "0x8F37162a47aF42D8676e4f5D343a855264EB5591",
  NEONBuynBurn: "0xBd48026E337f1419EC97F780b2045eb0ef2E0467",
  NEONLPStaking: "0x08e9363DE98F0E2414b6DC7a1081c5a29964319e",
  NEONFarm: "0xdF6ec9b93fa473Cb6772dc47326338ecBa374D39",
  OLDNEONFarm: "0x80020303898695b3Ab8017869B6158B49cD5B6CC",
  INC: "0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d",
  // Gearbox-style lending protocol addresses
  ADDRESS_PROVIDER: "0x22165bedc62d5C05a309C8b9AB50EeBd7B411B9E", // Your lending address provider
};


const COLLATERALS = {
  DAI: ADDRESSES.pulse.DAI,
  WPLS: ADDRESSES.pulse.WPLS,
  DAIPLS_LP: "0xE56043671df55dE5CDf8459710433C10324DE0aE"
};




const CREDIT_MANAGERS = [
  { addr: "0x1536379e29Da2B96ca6A5a3cE7923388789C0a4e", underlying: "0xA1077a294dDE1B09bB078844df40758a5D0f9a27", totalDebt: "99134342278047387943137856" },
  { addr: "0x3093C0477eC808d667a9e8E9bC9bA9a866f5e0f0", underlying: "0x95B303987A60C71504D99Aa1b13B4DA07b0790ab", totalDebt: "53662583566502463800000000" },
  { addr: "0x7D3b3F7af5FA599cF8F88e2019576c0710e36f16", underlying: "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39", totalDebt: "181357958" },
  { addr: "0x81AC877055E65057Ec89D88597e5EAffEa574A52", underlying: "0xb17D901469B9208B17d916112988A3FeD19b5cA1", totalDebt: "0" },
  { addr: "0x262f55749cC20AaD0a29ec9B16221573257260FA", underlying: "0xefD766cCb38EaF1dfd701853BFCe31359239F305", totalDebt: "1762415128912164960000" },
  { addr: "0x9E25772Aae7d98070dcAa4478A23D237d88441EF", underlying: "0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C", totalDebt: "4498477633100" },
  { addr: "0xE290879A4f8FC49EdbaEa58547F2997AdDe8b20b", underlying: "0x0Cb6F5a34ad42ec934882A05265A7d5F59b51A2f", totalDebt: "1011328175" },
  { addr: "0xE64b873dA543f8F1Cdb618BD8B6C51d874F83Ca7", underlying: "0x6B175474E89094C44Da98b954EedeAC495271d0F", totalDebt: "434493499424506401129673" },
  { addr: "0x10eAB8e10F769e1e4bd55367c97051C75f44D938", underlying: "0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07", totalDebt: "936323439" },
  { addr: "0xA16ed5a78381b17A7913462ab2C5bc9b69dbdD6f", underlying: "0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d", totalDebt: "0" }
];

// Gearbox-style lending functions using hardcoded data
function getCreditManagers() {
  return CREDIT_MANAGERS;
}

function getCreditAccountsValue(creditManager) {
  // Return the total debt (borrowed amount) for this credit manager
  return creditManager.totalDebt;
}

async function gearboxStyleTVL(timestamp, ethBlock, chainBlocks, { api }) {
  const creditManagers = getCreditManagers();

  creditManagers.forEach((cm) => {
    const totalDebt = getCreditAccountsValue(cm);
    if (totalDebt && totalDebt !== "0") {
      // Add the total debt (borrowed amounts) as TVL for each underlying token
      api.add(cm.underlying, totalDebt);
    }
  });

  return api.getBalances();
}

module.exports = {
  methodology: "NEON can be staked in the protocol, Farms hold PLS-DAI LP from user deposits that can be withdrawn after 500days",

  pulse: {
    borrowed: gearboxStyleTVL,
    tvl: sumTokensExport({
      owners: [contracts.NEONFarm, contracts.OLDNEONFarm],
      tokens: [COLLATERALS.DAI, COLLATERALS.WPLS, ADDRESSES.null],
      useDefaultCoreAssets: true,
      lps: [COLLATERALS.DAIPLS_LP]
    }),
    staking: sumTokensExport({
      owners: [contracts.NEONStaking],
      tokens: [contracts.NEON],
      useDefaultCoreAssets: true,
      lps: ['0xEd15552508E5200f0A2A693B05dDd3edEF59e624']
    }),
  },
};
