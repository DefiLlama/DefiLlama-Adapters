const { aaveExports } = require('../helper/aave')

module.exports={
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
    xdai: aaveExports('xdai', '0xae6933231Fb83257696E29B050cA6068D6E6Cc84', undefined, undefined, { 
        oracle: '0x1a88d967936a73326562d2310062eCE226Ed6664',
    }),
}