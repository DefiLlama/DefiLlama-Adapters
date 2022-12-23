const sdk = require("@defillama/sdk");
const getEntireSystemCollAbi = require("./getEntireSystemColl.abi.json");

const ETHW_ADDRESS = "0x0000000000000000000000000000000000000000";
//const USDW_TOKEN_ADDRESS = "0x520A36eE3aa0b506288915f91Fb4BBB23d09a7D7";

// StabilityPool holds deposited LUSD
//const STABILITY_POOL_ADDRESS = "0x78E03893818fcE52Bf7BBf3bb2854077AB10BA98";

// TroveManager holds total system collateral (deposited ETH)
const TROVE_MANAGER_ADDRESS = "0x25d27cbdfaFb1B7314AC5e409a1F24112e376829";

async function tvl(_, _b, {ethpow: block}) {
  const troveEthTvl = (
    await sdk.api.abi.call({
      target: TROVE_MANAGER_ADDRESS,
      chain: 'ethpow',
      abi: getEntireSystemCollAbi,
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
