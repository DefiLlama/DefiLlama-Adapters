const { aaveV3Export } = require("../helper/aave");

// Zentra Protocol - AAVE V3 lending markets on Citrea
// Markets: USDC, WcBTC, ctUSD
// https://zentra.fi
module.exports = aaveV3Export({
  citrea: '0x0FC811fE6bD0Be53717f9ca722E30a7bc4B90C31',
})
