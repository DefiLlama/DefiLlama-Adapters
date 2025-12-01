const { compoundExports2, methodology } = require('../helper/compound')

module.exports = {
    monad: compoundExports2({ comptroller: '0xFc57bF0733e5e65d8549fc2922919Cfb97e62D5f' }),
    methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.",
}
