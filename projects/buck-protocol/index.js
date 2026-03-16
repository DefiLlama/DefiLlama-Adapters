const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

// BUCK Protocol — Bitcoin-backed yield-bearing savings coin
// TVL = USDC held in the LiquidityReserve (reserve backing BUCK redemptions)

const LIQUIDITY_RESERVE = "0x1A426E3A87368a4851f7443Ff656A054Af872f66";

module.exports = {
  methodology:
    "TVL is the USDC held in the LiquidityReserve contract, which backs BUCK token minting and redemptions at the Liquidity Window.",
  ethereum: {
    tvl: sumTokensExport({
      owners: [LIQUIDITY_RESERVE],
      tokens: [ADDRESSES.ethereum.USDC],
    }),
  },
};
