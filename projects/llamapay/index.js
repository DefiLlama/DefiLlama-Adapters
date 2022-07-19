const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { getChainTransform, getFixBalances } = require("../helper/portedTokens");

const llamaPayAvax = "0x7d507b4c2d7e54da5731f643506996da8525f4a3";
const llamaPayDefault = "0xde1C04855c2828431ba637675B6929A684f84C7F";
const llamaPayVesting = "0xB93427b83573C8F27a08A909045c3e809610411a";
const llamaPayMeter = "0xc666badd040d5e471d2b77296fef46165ffe5132";
const llamaPayMeterVesting = "0x6B24Fe659D1E91f8800E86600DE577A4cA8814a6";
const llamaPayMetis = "0x43634d1C608f16Fb0f4926c12b54124C93030600";

async function calculateTvl(llamapay, vesting, block, chain) {
  const transform = await getChainTransform(chain);
  const balances = {};

  const contractCount = (
    await sdk.api.abi.call({
      target: llamapay,
      abi: abi["getLlamaPayContractCount"],
      block,
      chain,
    })
  ).output;

  const llamaPayContracts = (
    await sdk.api.abi.multiCall({
      calls: Array.from({ length: Number(contractCount) }, (_, k) => ({
        target: llamapay,
        params: k,
      })),
      abi: abi["getLlamaPayContractByIndex"],
      block,
      chain,
    })
  ).output;

  const llamaPayTokens = (
    await sdk.api.abi.multiCall({
      calls: llamaPayContracts.map((p) => ({
        target: p.output,
      })),
      abi: abi["token"],
      block,
      chain,
    })
  ).output;

  const tokenBalances = (
    await sdk.api.abi.multiCall({
      calls: llamaPayTokens.map((p) => ({
        target: p.output,
        params: p.input.target,
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;

  tokenBalances.map((p) => {
    const token = p.input.target.toLowerCase();
    const balance = p.output;
    sdk.util.sumSingleBalance(balances, transform(token), balance);
  });

  const vestingCount = (
    await sdk.api.abi.call({
      target: vesting,
      abi: abi["escrows_length"],
      block,
      chain,
    })
  ).output;

  const vestingContracts = (
    await sdk.api.abi.multiCall({
      calls: Array.from({ length: Number(vestingCount) }, (_, k) => ({
        target: vesting,
        params: k,
      })),
      abi: abi["escrows"],
      block,
      chain,
    })
  ).output;

  const vestedTokens = (
    await sdk.api.abi.multiCall({
      calls: vestingContracts.map((p) => ({
        target: p.output,
      })),
      abi: abi["vested_token"],
      block,
      chain,
    })
  ).output;

  const vestedTokenBalances = (
    await sdk.api.abi.multiCall({
      calls: vestedTokens.map((p) => ({
        target: p.output,
        params: p.input.target,
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;

  if (vestedTokenBalances.length > 0) {
    vestedTokenBalances.map((p) => {
      const token = p.input.target.toLowerCase();
      const balance = p.output;
      sdk.util.sumSingleBalance(balances, transform(token), balance);
    });
  }

  (await getFixBalances(chain))(balances);

  return balances;
}

const chains = [
  "avax",
  "arbitrum",
  "bsc",
  "fantom",
  "ethereum",
  "optimism",
  "polygon",
  "xdai",
  "meter",
  "metis",
];

module.exports = {};

chains.forEach((chain) => {
  let contract = llamaPayDefault;
  let vestingContract = llamaPayVesting;

  switch (chain) {
    case "avax":
      contract = llamaPayAvax;
      break;
    case "meter":
      contract = llamaPayMeter;
      vestingContract = llamaPayMeterVesting;
      break;
    case "metis":
      contract = llamaPayMetis;
      break;
  }

  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) =>
      calculateTvl(contract, vestingContract, block, chain),
  };
});
