const sdk = require("@defillama/sdk");

// TroveManager holds total system collateral (deposited ETH)
const TROVE_MANAGER_ADDRESS = "0x25d27cbdfaFb1B7314AC5e409a1F24112e376829";

async function tvl(_, _b, {ethpow: block}) {
  const troveEthTvl = (
    await sdk.api.abi.call({
      target: TROVE_MANAGER_ADDRESS,
      chain: 'ethpow',
      abi: "uint256:getEntireSystemColl",
      block,
    })
  ).output;

  return {
    'coingecko:ethereum-pow-iou': troveEthTvl/1e18 ,
  };
}

module.exports = {
  ethpow: {
    tvl,
  }
};
