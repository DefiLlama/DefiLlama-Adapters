const protocol = require("./protocol");
const { staking } = require('../helper/staking')
const { chains, } = require("./constants");
const { nullAddress } = require("../helper/tokenMapping");

async function tvl(api) {
  const lendables = await protocol.getLendables(api);
  const tradables = await protocol.getTradables(api);
  const shortables = await protocol.getShortables(api);
  const proxyLendables = await protocol.getProxyLendables(api);

  const reserves = await protocol.getReserves([...lendables, ...shortables], api);
  const pairs = await protocol.getPairs(lendables, tradables, api);
  const routablePairs = await protocol.getRoutablePairs(lendables, proxyLendables, tradables, api);
  const shortingPairs = await protocol.getShortingPairs(lendables, shortables, api);
  const routableShortingPairs = await protocol.getRoutableShortingPairs(lendables, proxyLendables, shortables, api);
  const list = [
    reserves,
    pairs,
    routablePairs,
    shortingPairs,
    routableShortingPairs
  ].flat().filter(pair => pair[1] !== nullAddress)
  return api.sumTokens({ tokensAndOwners: list })
}

module.exports = {
  start: '2021-04-12',            // Mon Apr 12 2021 09:00:00
};

Object.keys(chains).forEach(chain => {
  const { WOW, xWOW, } = chains[chain]
  module.exports[chain] = {
    tvl,
    staking: staking(xWOW, WOW)
  }
})

module.exports.heco.tvl = () => ({})
module.exports.heco.staking = () => ({})
// module.exports.kava.tvl = () => ({})
// module.exports.kava.staking = () => ({})