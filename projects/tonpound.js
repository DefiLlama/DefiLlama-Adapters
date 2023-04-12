const { usdCompoundExports } = require('./helper/compound');

const tonpoundComptroller = "0x1775286Cbe9db126a95AbF52c58a3214FCA26803";

const tonpound = usdCompoundExports(tonpoundComptroller, "ethereum", "0x276d2b35b4204E8c3A5c2B9031cA63e72acb00DE")
module.exports = {
  ethereum:{
    tvl: tonpound.tvl,
    borrowed: tonpound.borrowed
  },
  methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted.",
}
