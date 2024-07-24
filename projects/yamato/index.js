const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");

const ETH_ADDRESS = ADDRESSES.null;
// POOL holds total system collateral (deposited ETH)
const YAMATO_CONTRACT_ADDRESS = "0x02Fe72b2E9fF717EbF3049333B184E9Cd984f257";

async function tvl(_, block) {

  const poolETHTvl = (
    await sdk.api.abi.call({
      target: YAMATO_CONTRACT_ADDRESS,
      abi: "uint256:getStates",
      block,
    })
  ).output;

  return {
    [ETH_ADDRESS]: poolETHTvl,
  };
}

module.exports = {
    start: 1690387200,
  ethereum: {
    tvl,
  }
  
};
