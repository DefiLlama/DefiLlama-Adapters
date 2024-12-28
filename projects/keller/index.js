const { getUniTVL } = require('../helper/cache/uniswap.js')
const { staking } = require('../helper/staking.js')

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL shows the sum of tokens deposited in our pools and Staking shows the number of $KELL locked in the Voting Escrow contract.',
  scroll: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0xbc83f7dF70aE8A3e4192e1916d9D0F5C2ee86367',  hasStablePools: true, }),
    staking: staking("0x3aC0Bd8433bFC451BB1E1E90CcEF697750512CA2", "0xCF4706120623c527e32493057A4DC0cae5FC8201"),
  },
}