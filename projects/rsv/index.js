const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const vaultContract = "0xAeDCFcdD80573c2a312d15d6Bb9d921a01E4FB0f";
const basketContract = "0x7CC227729270426da6e9E3f51838CF5C7dbc1588";

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const tokenAddresses = (
    await sdk.api.abi.call({
      abi: abi.getTokens,
      target: basketContract,
      ethBlock,
    })
  ).output;

  for (const token of tokenAddresses) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [[token, false]],
      [vaultContract]
    );
  }

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
  methodology:
    "We count liquidity on the Vault through itself Contract",
};
