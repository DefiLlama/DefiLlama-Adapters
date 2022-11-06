const utils = require("../helper/utils");
const { ohmTvl } = require('../helper/ohm')

function ohmTvlMultiTreasuries(treasuries, treasuryTokens, chain, stakingAddress, stakingToken, transformOriginal, fix = id=>id, tokenOnCoingecko = true) {
  // Accumulate tvl for multiple treasuries, executing simply ohmTvl
  const tvl_per_treasury = treasuries.map(treasury =>
      ohmTvl(treasury, treasuryTokens, chain, stakingAddress, stakingToken, transformOriginal, fix, tokenOnCoingecko)
  )

  // Edit TVL of object to be the cumulative tvl
  const tvl_object = tvl_per_treasury[0]
  const tvls = tvl_per_treasury.map(o => o[chain].tvl)
  tvl_object[chain].tvl = sdk.util.sumChainTvls(tvls)
  return tvl_object
}

function sphereTVL() {
  return async () =>
    utils
      .fetchURL("https://spheretvl.simsalacrypto.workers.dev/")
      .then((d) => ({ "usd-coin": d.data["portfolio"]["net_worth"] }));
}

function stakedTokens() {
  return ohmTvlMultiTreasuries(undefined, undefined, "polygon", "0x284eba456e27ec9d07a656ce7cf68f2c78578f2e", "0x62f594339830b90ae4c084ae7d223ffafd9658a7", undefined, undefined, true)
}

module.exports = {
  timetravel: false,
  polygon: {
    tvl: sphereTVL(),
    staking: stakedTokens(),
  },
};
