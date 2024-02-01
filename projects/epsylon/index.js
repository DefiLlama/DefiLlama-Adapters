const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { default: BigNumber } = require("bignumber.js");

const USDC_VAULT = "0x756d09263483dC5A6A0023bb80933db2C680703E";
const USDC_2_VAULT = "0x69e475b67052987707E953b684c7d437e15AC511";
const WFTM_VAULT = "0x22c538c1EeF31B662b71D5C8DB47847d30784976";
const USDC = ADDRESSES.ethereum.USDC;
const WFTM = ADDRESSES.ethereum.FTM;

async function tvl() {
  let balances = {};

  const usdcVaultTVL = await sdk.api.abi.call({
    target: USDC_VAULT,
    abi: abi["totalAssets"],
    chain: "fantom",
  });

  const usdcVault2TVL = await sdk.api.abi.call({
    target: USDC_2_VAULT,
    abi: abi["totalAssets"],
    chain: "fantom",
  });

  const wftmVaultTVL = await sdk.api.abi.call({
    target: WFTM_VAULT,
    abi: abi["totalAssets"],
    chain: "fantom",
  });

  balances[USDC] = new BigNumber(usdcVaultTVL.output).plus(
    new BigNumber(usdcVault2TVL.output)
  );
  balances[WFTM] = wftmVaultTVL.output;

  return balances;
}

module.exports = {
  timetravel: false,
  methodology: `Track the yield generated and deposits made to the vaults`,
  fantom: {
    tvl,
  },
};
