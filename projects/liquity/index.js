const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");

const ETH_ADDRESS = ADDRESSES.null;
// TroveManager holds total system collateral (deposited ETH)
const TROVE_MANAGER_ADDRESS = "0xA39739EF8b0231DbFA0DcdA07d7e29faAbCf4bb2";

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
  start: 1617607296,
  ethereum: {
    tvl,
  }
  
};
