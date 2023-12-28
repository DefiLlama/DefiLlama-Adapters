const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
// const { staking } = require("../helper/staking.js");

const ETH_ADDRESS = ADDRESSES.null;
// TroveManager holds total system collateral (deposited ETH)
const TROVE_MANAGER_ADDRESS = "0xAeB0B38040aDdc4a2b520919f13944D9bC944435";
const STAKING_ADDRESS = "0x109e342FE7132585abFa785887E2c05c85Fbcf71";
const LQTY_ADDRESS = "";
const WEN = "0x20143c45c2ce7984799079f256d8a68a918eeee6";

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
    borrowing: tvl,
    // staking: staking(STAKING_ADDRESS, LQTY_ADDRESS, "iotex")
    stabilityPool: staking
  }

};
