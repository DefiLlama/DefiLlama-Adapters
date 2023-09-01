const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking.js");

const ETH_ADDRESS = ADDRESSES.null;
// TroveManager holds total system collateral (deposited ETH)
const TROVE_MANAGER_ADDRESS = "0x51c014510A5AdA43408b40D49eF52094014ef3A7";
const STAKING_ADDRESS = "0x424891f1D6D4De5c07B6E3F74B3709D6BD9E77ea";
const ALTR_ADDRESS = "0xD1ffCacFc630CE68d3cd3369F5db829a3ed01fE2"

async function tvl(_, block) {

  const troveEthTvl = (
    await sdk.api.abi.call({
      target: TROVE_MANAGER_ADDRESS,
      abi: "uint256:getEntireSystemColl",
      block,
    })
  ).output;

  return {
    [ETH_ADDRESS]: troveEthTvl,
  };
}

module.exports = {
  timetravel: true,
  start: 1692423851,
  ethereum: {
    tvl,
    staking: staking(STAKING_ADDRESS, ALTR_ADDRESS, "ethereum")
  }
  
};
