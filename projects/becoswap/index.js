const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const { staking } = require("../helper/staking");

const chainTvl = getChainTvl({
  kardia: 'https://graph.kaistream.org/subgraphs/name/beco/exchange'
}, "becoFactories")

const becoToken = '0x2Eddba8b949048861d2272068A94792275A51658'
const masterChef = '0x20e8Ff1e1d9BC429489dA76B1Fc20A9BFbF3ee7e'

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://becoswap.com/info as the source. Staking accounts for the BECO locked in MasterChef (0x20e8Ff1e1d9BC429489dA76B1Fc20A9BFbF3ee7e)',
  kardia: {
    staking: staking(masterChef, becoToken, "kardia", "becoswap-token", 18),
    tvl: chainTvl("kardia")
  },
}
