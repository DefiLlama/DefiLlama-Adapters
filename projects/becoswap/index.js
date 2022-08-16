const { getUniTVL } = require('../helper/unknownTokens');
const { staking } = require("../helper/staking");

const becoToken = '0x2Eddba8b949048861d2272068A94792275A51658'
const masterChef = '0x20e8Ff1e1d9BC429489dA76B1Fc20A9BFbF3ee7e'

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://becoswap.com/info as the source. Staking accounts for the BECO locked in MasterChef (0x20e8Ff1e1d9BC429489dA76B1Fc20A9BFbF3ee7e)',
  kardia: {
    staking: staking(masterChef, becoToken, "kardia"),
    tvl: getUniTVL({
      chain: 'kardia',
      coreAssets: [
        '0xAF984E23EAA3E7967F3C5E007fbe397D8566D23d', // WKAI
        '0x92364Ec610eFa050D296f1EEB131f2139FB8810e', // KUSDT
        becoToken,
      ],
      factory: '0x58b54BCDF2aF8a70dD6433EB39b308148261bB49',
    })
  },
};
