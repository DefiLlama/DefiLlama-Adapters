const sdk = require("@defillama/sdk");
// const MINT_TOKEN_CONTRACT = "0x1f3Af095CDa17d63cad238358837321e95FC5915";
const LSDVAULT_CONTRACT = "0x51A80238B5738725128d3a3e06Ab41c1d4C05C74";

const BNB_COMMUNAL_FARM = "0x2C8a4058DB744808FFFA97E29c8E1b7cBF7AAd01";

// const LSD_REGISTRY_CONTRACT = "0xA857904691bbdEca2e768B318B5f6b9bfA698b7C";

const wstETHAddress = "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0";
const sfrxETHAddress = "0xac3e018457b222d93114458476f3e3416abbe38f";
const rETHAddress = "0xae78736cd615f374d3085123a210448e74fc6393";
const cbETHAddress = "0xbe9895146f7af43049ca1c1ae358b0541ea49704";

const lsdAddresses = [sfrxETHAddress, rETHAddress, wstETHAddress, cbETHAddress];

const bnbUSD = "0x91d6d6aF7635B7b23A8CED9508117965180e2362";
const bnbUnshETH = "0x0Ae38f7E10A43B5b2fB064B42a2f4514cbA909ef";
const bnbTokenAddresses = [bnbUnshETH, bnbUSD];

const abi = {
  lsdVault: "function supportedLSDs() public returns (address[])",
};

// async function getAllLSDAddresses() {
//   const lsds = (
//     await sdk.api.abi.call({
//       abi: abi.lsdVault,
//       target: LSDVAULT_CONTRACT,
//       params: [],
//     })
//   ).output;
//   return lsds;
// }

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  // get list of supported lsds
  // const lsdAddresses = await getAllLSDAddresses();

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
