const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const chain = "ethereum";

// addresses pools
const CapitalPool = "0x131fb74c6fede6d6710ff224e07ce0ed8123f144";
const insureStaking = "0x55978a6f6a4cfa00d5a8b442e93e42c025d0890c";
const ClaimVoting = "0x81d73999fabec7e8355d76d1010afbe3068f08fa";
// addresses tokens

const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const insure = "0xd83AE04c9eD29d6D3E6Bf720C71bc7BeB424393E";

// addresses getters
const PolicyBookRegistry = "0x131fb74c6fede6d6710ff224e07ce0ed8123f144";
const ShieldMining = "0x3dc07E60ecB3d064d20c386217ceeF8e3905916b";

// =================== GET LIST OF POLICY BOOKS =================== //
// async function getPolicyBookList(timestamp, block) {
//   const countPolicyBooks = (
//     await sdk.api.abi.call({
//       target: PolicyBookRegistry,
//       abi: abi["count"],
//       chain: chain,
//       block: block,
//     })
//   ).output;
//   const listPolicyBooks = (
//     await sdk.api.abi.call({
//       target: PolicyBookRegistry,
//       params: [0, countPolicyBooks],
//       abi: abi["list"],
//       chain: chain,
//       block: block,
//     })
//   ).output;
//   return listPolicyBooks;
// }

async function tvl(timestamp, block) {
  let balances = {};

  // =================== GET usdc BALANCES =================== //
  const vusdcBalances = (
    await sdk.api.abi.call({
      target: CapitalPool,
      abi: abi["valueAll"],
      chain: chain,
      block: block,
    })
  ).output;
  sdk.util.sumSingleBalance(balances, usdc, vusdcBalances);

  console.log(tvl);

  return balances;
}

// =================== GET INSURE BALANCES =================== //
async function staking(timestamp, block) {
  let balances = {};

  const insureBalances = (
    await sdk.api.abi.call({
      target: ShieldMining,
      abi: abi["supply"],
      chain: chain,
      block: block,
    })
  ).output;
  sdk.util.sumSingleBalance(balances, insure ,insureBalances);

  return balances;
}

module.exports = {
  ethereum: {
    tvl: tvl,
    staking: staking,
  },
};
