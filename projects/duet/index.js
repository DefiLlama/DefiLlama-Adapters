const axios = require("axios");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");
const collateralReaderContractABI = require("./abis/collateral-reader.json");

const COLLATERAL_READER_CONTRACT = "0xFfB8FD0E5eA13bb71401B19e00f9F934746f0b7A";
const TOKEN_LIST_URL = "https://app.duet.finance/tokens-v0.json";

async function fetch() {
  const ret = await axios.get(TOKEN_LIST_URL);
  const tokens = ret.data;
  const vaultList = [];
  for (const token of tokens) {
    if (!token.vaults || token.vaults.length < 1) {
      continue;
    }
    vaultList.push(...token.vaults);
  }
  const uniqueVaults = new Set(vaultList.filter(vault => vault.displayPosition !== "DASSETS").map(vault => vault.vaultAddress && vault.vaultAddress.trim()).filter(Boolean));
  const { 1: tokenTVLs } = (await sdk.api.abi.call({
    abi: collateralReaderContractABI.depositVaultValues,
    chain: "bsc",
    target: COLLATERAL_READER_CONTRACT,
    params: [[...uniqueVaults], false]
  })).output;

  return tokenTVLs.reduce((previous, current) => previous.plus(current), new BigNumber(0)).div(Math.pow(10, 8));
}

module.exports = {
  methodology: "TVL is the sum of the USD value of all tokens in the staking pool",
  fetch
};


