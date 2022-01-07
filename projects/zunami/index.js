const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const zunamiContract = "0x63Eacf87fF7897B06705cABF56A3c5Dad33DFa8c";
const strategiesContracts = [
  "0xb6a2641D9a4e8cfa9cE74784222Fd55f8B328179",
  "0x0C597d8e2726AE58db3cA43225CA47fCcC96208B",
];

const ethTvl = async (chainBlocks) => {
  const balances = {};

  const strategiesTokens = (
    await sdk.api.abi.multiCall({
      abi: abi.token,
      calls: strategiesContracts.map((strat) => ({
        target: strat,
      })),
    })
  ).output.map((t) => t.output);

  const strategiesTotalHoling = (
    await sdk.api.abi.multiCall({
      abi: abi.totalHoldings,
      calls: strategiesContracts.map((strat) => ({
        target: strat,
      })),
    })
  ).output.map((b) => b.output);

  strategiesTokens.forEach((token, idx) => {
    sdk.util.sumSingleBalance(balances, token, strategiesTotalHoling[idx]);
  });

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  methodology: "Counts tvl deposited throuth Strategies Contract",
};
