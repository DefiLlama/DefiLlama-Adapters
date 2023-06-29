const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

// constants
const ETHER = new BigNumber(10).pow(18);

// ABIs
const dashBoardABI = 'function getTVLInfo() external view returns (tuple(uint256 earnTVL, uint256 collateralTVL, uint256 totalMintedWCD))'

// contracts
const dashboardWemix = "0x2F7D5012e3629D236f229712EE6066D47b2B3B3f";

// functions
const tvl = async () => {
  const chain = "wemix"

  const res = await sdk.api.abi.call(
    {
      target: dashboardWemix,
      chain,
      abi: dashBoardABI
    }
  )

  const earnTVL = new BigNumber(res.output.earnTVL)
  const collateralTVL = new BigNumber(res.output.collateralTVL)
  const totalTVL = earnTVL.plus(collateralTVL)

  return {
    'usd': totalTVL.dividedBy(ETHER).toNumber()
  }
}

module.exports = {
  timetravel: true,
  doublecounted: false,
  methodology:
    "Total value of collateral assets, WCD staked in our vault and collaterals in pegging module(PSM)",
  wemix: {
    tvl: tvl,
  },
};
