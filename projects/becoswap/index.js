const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const { getUniTVL } = require('../helper/unknownTokens');
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
    // tvl: chainTvl("kardia"),
    tvl: getUniTVL({
      chain: 'kardia',
      coreAssets: [
        '0x92364Ec610eFa050D296f1EEB131f2139FB8810e', // KUSDT
        becoToken,
      ],
      factory: '0x58b54BCDF2aF8a70dD6433EB39b308148261bB49',
    })
  },
};
