const sdk = require("@defillama/sdk");

// upgraded LSDVault V2
const LSDVAULT_CONTRACT = "0x51A80238B5738725128d3a3e06Ab41c1d4C05C74";

// list of all the supported LSDs deposited in vault
const wstETHAddress = "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0";
const sfrxETHAddress = "0xac3e018457b222d93114458476f3e3416abbe38f";
const rETHAddress = "0xae78736cd615f374d3085123a210448e74fc6393";
const cbETHAddress = "0xbe9895146f7af43049ca1c1ae358b0541ea49704";

const lsdAddresses = [sfrxETHAddress, rETHAddress, wstETHAddress, cbETHAddress];

const abi = {
  lsdVault: "function supportedLSDs() public returns (address[])",
};

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

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
