const ADDRESSES = require('../helper/coreAssets.json')
const { pool2 } = require("../helper/pool2");

const LnCollateralSystemAddress = "0xcE2c94d40e289915d4401c3802D75f6cA5FEf57E";

const tokens = {
  lUSD: "0x23e8a70534308a4aaf76fb8c32ec13d17a3bd89e",
  LINA: "0x762539b45A1dCcE3D36d080F74d1AED37844b878",
  bUSD: ADDRESSES.bsc.BUSD,
  LPTOKEN: "0x392f351fc02a3b74f7900de81a9aaac13ec28e95",
};

const vaultpools = {
  bUSD: "0x072F11c46146Ce636691d387BFbF8fD28e818EE8",
  lUSD: "0xD36b669491ADFB5cDE87C281dF417148674f88B4",
  LP: "0x12efdFF85f717ac1738CF50Be5f4Cdc916b0B8B1",
}


async function tvl(api) {
  return api.sumTokens({
    tokensAndOwners: [
      [[tokens.LINA], LnCollateralSystemAddress],
      [[tokens.bUSD], vaultpools["bUSD"]],
    ]
  });
}

module.exports = {
    methodology: "Counts LINA used to collateralize lUSD",
  bsc: {
    tvl,
    pool2: pool2(vaultpools["LP"], "0x392f351fc02a3b74f7900de81a9aaac13ec28e95"),
  },
};
