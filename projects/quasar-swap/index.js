const ADDRESSES = require('../helper/coreAssets.json')
//const { masterChefExports } = require('../helper/masterchef');
// const { sumTokens2 } = require("../helper/unwrapLPs");
const { getUniTVL, sumUnknownTokens } = require("../helper/unknownTokens");
// const { mergeExports } = require("../helper/utils");

// // const masterchef = '0x693D075Db2F6c231e2f375c29EDd52F47027b45E'
const sntNova = "0x657a66332a65b535da6c5d67b8cd1d410c161a08";
const qsrToken = "0x356c044B99e9378C1B28A1cAb2F95Cd65E877F33";
// const qsrLP = "0xf8c1b66e95790467819bb25f852e37b59e47c16d"
const nUSD = ADDRESSES.nova.NUSD
const sntQsrFarm = "0x0e9768b0199e7b31852b4effb70031d860b812d6";
// const sntNusdFarm = "0x050bc8fa6da93dff0d7629923e0972c0aecebb9e";
const poolAuto = "0x71da5557c9D89a0b34Ef3A6FE0EcC750c93996e9";
const poolManual = "0x693D075Db2F6c231e2f375c29EDd52F47027b45E";
const dexFactory = "0x9FF350c22d2A1A9d2867E1afb44B83eF114DFD7b";

module.exports = {
/*   nova: {
    tvl: getUniTVL({
      factory: dexFactory,
      useDefaultCoreAssets: true,
    }),
    staking: async (_, _b, { nova: block }) =>
    sumUnknownTokens({
        owners: [poolAuto, poolManual],
        tokens: [qsrToken],
        lps: [sntQsrFarm],
        useDefaultCoreAssets: true,
        chain: "nova",
        block,
      }),
  }, */
  //deadFrom: "2024-01-01",
  nova: {
    tvl: () => ({}),
    staking: () => ({}),
  }
}