const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { BigNumber } = require("ethers");
const ADDRESSES = require('../helper/coreAssets.json')

const DULLAHAN_VAULT = "0x167c606be99DBf5A8aF61E1983E5B309e8FA2Ae7";

async function ethTvl(timestamp, block, _, { api },) {
  const balances = {};

  let totalAssets = await sdk.api.abi.call({
    abi: abi["assets"],
    block: block,
    target: DULLAHAN_VAULT
  });

  sdk.util.sumSingleBalance(balances, ADDRESSES.ethereum.AAVE, totalAssets.output)
  console.log(balances)

  return balances;
}

module.exports = {
  methodology: "Amount of stkAAVE owned by the vault",
  ethereum: {
    tvl: ethTvl,
  },
  start: 17824291
};
