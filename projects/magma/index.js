const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
// const { staking } = require("../helper/staking.js");

const ETH_ADDRESS = ADDRESSES.null;
// TroveManager holds total system collateral (deposited ETH)
const TROVE_MANAGER_ADDRESS = "0x21d81DABF6985587CE64C2E8EB12F69DF2178fe2";
const STAKING_ADDRESS = "0x037a2e9a464fbA409D0E55600836864B410d6Dd8";
const LQTY_ADDRESS = "";
const WEN = "0x6C0bf4b53696b5434A0D21C7D13Aa3cbF754913E";

async function tvl(_, block) {
  const troveEthTvl = (
    await sdk.api.abi.call({
      target: TROVE_MANAGER_ADDRESS,
      abi: "uint256:getEntireSystemColl",
      block,
      chain: "iotex",
      skipCache: true
    })
  ).output;

  return {
    [ETH_ADDRESS]: troveEthTvl,
  };
}

async function staking(_, block) {
  const balance = (
    await sdk.api.abi.call(
      {
        target: WEN,
        abi: "erc20:balanceOf",
        chain: "iotex",
        params: [STAKING_ADDRESS]
      })
  ).output;

  return {
    [WEN]: balance,
  };
}

module.exports = {
  timetravel: true,
  start: 1702360765,
  iotex: {
    tvl,
    // staking: staking(STAKING_ADDRESS, LQTY_ADDRESS, "iotex")
    staking
  }

};
