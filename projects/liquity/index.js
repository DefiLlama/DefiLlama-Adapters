const sdk = require("@defillama/sdk");
const getEntireSystemCollAbi = require("./getEntireSystemColl.abi.json");

const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
const LUSD_TOKEN_ADDRESS = "0x5f98805a4e8be255a32880fdec7f6728c6568ba0";

// StabilityPool holds deposited LUSD
const STABILITY_POOL_ADDRESS = "0x66017D22b0f8556afDd19FC67041899Eb65a21bb";

// TroveManager holds total system collateral (deposited ETH)
const TROVE_MANAGER_ADDRESS = "0xA39739EF8b0231DbFA0DcdA07d7e29faAbCf4bb2";

async function tvl(_, block) {
  const stabilityPoolLusdTvl = (
    await sdk.api.erc20.balanceOf({
      target: LUSD_TOKEN_ADDRESS,
      owner: STABILITY_POOL_ADDRESS,
      block,
    })
  ).output;

  const troveEthTvl = (
    await sdk.api.abi.call({
      target: TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block,
    })
  ).output;

  return {
    [ETH_ADDRESS]: troveEthTvl,
    [LUSD_TOKEN_ADDRESS]: stabilityPoolLusdTvl,
  };
}

module.exports = {
  timetravel: true,
  name: "Liquity",
  token: "LUSD",
  category: "minting",
  start: 1617607296,
  tvl,
};
