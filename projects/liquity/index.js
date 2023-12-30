const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking.js");

const ETH_ADDRESS = ADDRESSES.null;
// TroveManager holds total system collateral (deposited ETH)
const TROVE_MANAGER_ADDRESS = "0xA39739EF8b0231DbFA0DcdA07d7e29faAbCf4bb2";
const STAKING_ADDRESS = "0x4f9Fbb3f1E99B56e0Fe2892e623Ed36A76Fc605d";
const LQTY_ADDRESS = "0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D"

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
    staking: staking(STAKING_ADDRESS, LQTY_ADDRESS, "ethereum")
  }
  
};
