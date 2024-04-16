const { getUniTVL } = require('../helper/unknownTokens');
const { staking } = require("../helper/staking");

const becoToken = '0x2Eddba8b949048861d2272068A94792275A51658'
const masterChef = '0x20e8Ff1e1d9BC429489dA76B1Fc20A9BFbF3ee7e'

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://becoswap.com/info as the source. Staking accounts for the BECO locked in MasterChef (0x20e8Ff1e1d9BC429489dA76B1Fc20A9BFbF3ee7e)',
  kardia: {
    staking: staking(masterChef, becoToken),
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x58b54BCDF2aF8a70dD6433EB39b308148261bB49',
    })
  },
};
