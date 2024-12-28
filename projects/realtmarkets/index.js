const { aaveExports, methodology, } = require('../helper/aave')

module.exports={
    misrepresentedTokens: true,
    methodology: methodology,
    xdai: aaveExports('xdai', '0xae6933231Fb83257696E29B050cA6068D6E6Cc84', undefined, undefined, { 
        oracle: '0x1a88d967936a73326562d2310062eCE226Ed6664',
    }),
}