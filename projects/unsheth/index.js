const sdk = require("@defillama/sdk");
const MINT_TOKEN_CONTRACT = "0x1f3Af095CDa17d63cad238358837321e95FC5915";
const LSDVAULT_CONTRACT = "0xE76Ffee8722c21b390eebe71b67D95602f58237F";
const LSD_REGISTRY_CONTRACT = "0xA857904691bbdEca2e768B318B5f6b9bfA698b7C";
const SUSHI_USHWETH = "0xAAF448d30F01b429FB6e7F9AF6A8FF66e694F312";
const SUSHISWAP_LP = "0xaaf448d30f01b429fb6e7f9af6a8ff66e694f312";
const WETH_CONTRACT = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const abi = {
  regLsdAddress: "function lsdAddresses() returns (address[])",
};

async function getAllLSDAddresses() {
  const lsds = (
    await sdk.api.abi.call({
      abi: abi.regLsdAddress,
      target: LSD_REGISTRY_CONTRACT,
      params: [],
    })
  ).output;
  return lsds;
}

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  // get list of supported lsds
  const lsdAddresses = await getAllLSDAddresses();

  const calls = lsdAddresses.map((i) => ({
    target: i,
    params: LSDVAULT_CONTRACT,
  }));

  // fetch balance of each lsd in vault contract
  const bals = (
    await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: calls,
    })
  ).output;

  bals.forEach((v, i) =>
    sdk.util.sumSingleBalance(balances, lsdAddresses[i], v.output)
  );

  return balances;
}

module.exports = {
  ethereum: {
    tvl,
  },
}; // node test.js projects/unsheth/index.js
