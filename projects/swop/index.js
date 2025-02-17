const { sumTokens, call } = require('../helper/chain/waves');
const { getConfig } = require("../helper/cache");
const { getUniTVL } = require('../helper/unknownTokens')

const swopfiBackendEndpoint = "https://backend.swop.fi";

const getSwopFiTVL = async (api) => {
  const { pools } = await getConfig('swop', `${swopfiBackendEndpoint}/pools`)
  for (const pool of pools) {
    await sumTokens({ owners: [pool.id], api, includeWaves: true, blacklistedTokens: ['Ehie5xYpeN8op1Cctc6aGUrqx8jq3jtf1DSjXDbfm7aT'] })
  }
}

module.exports = {
  timetravel: false, // Waves blockchain,
  methodology: "Counts the tokens locked on AMM pools",
  misrepresentedTokens: true,
  hallmarks: [
      [1730299107, "Unit0 Protocol Lunch"]
  ],
  waves: {
    tvl: getSwopFiTVL,
    staking: async () => {
      const res = await call({ target: '3PLHVWCqA9DJPDbadUofTohnCULLauiDWhS', key: 'total_GSwop_amount' })
      return { swop: res / 1e8 }
    }
  },
  unit0: {
    tvl: getUniTVL({ factory: '0x944Eb5ac122Ea8c764Fa80e80A7fCA2C9A13Ab0a', useDefaultCoreAssets: true})
  }
};
