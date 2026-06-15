const registryTokensByChain = require("./registryTokens.js");
const registryTokensWithUnderlyingAddressesByChain = require("./registryTokensWithUnderlyingAddresses.js");
const sdk = require("@defillama/sdk");
const { getAllTokenBalances } = require("./hinkalUtils.js");
const { sumTokensExport } = require("../helper/solana.js");
const ownerByChain = require("./owners.js");
const { addPublicTvl } = require("./publicTvl.js");
const solanaTokens = require("./solanaTokens.js");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const tvl = async (_, _1, _2, { chain, api }) => {
  const tokenBalances = await getAllTokenBalances(
    registryTokensByChain[chain],
    chain
  );

  const chainTokensWithUnderlyingAddresses =
    registryTokensWithUnderlyingAddressesByChain[chain];

  const mappedTokens = tokenBalances.map((token) => {
    const tokenUnderlyingAddress = chainTokensWithUnderlyingAddresses
      ? chainTokensWithUnderlyingAddresses[token.address]
      : undefined;

    let address = tokenUnderlyingAddress ? tokenUnderlyingAddress : token.address;
    if (chain === "tron" && address !== ZERO_ADDRESS) {
      address = sdk.tron.unhexifyTarget(address);
    }

    return {
      address,
      balance: token.balance,
    };
  });

  api.addTokens(
    mappedTokens.map((token) => token.address),
    mappedTokens.map((token) => token.balance)
  );

  await addPublicTvl(api);

  return api.getBalances();
};

module.exports = {
  ethereum: {
    tvl,
  },
  base: {
    tvl,
  },
  arbitrum: {
    tvl,
  },
  optimism: {
    tvl,
  },
  polygon: {
    tvl,
  },
  tron: {
    tvl,
  },
  solana: {
    tvl: async (api) => {
      await sumTokensExport({
        owner: ownerByChain.solana,
        tokens: solanaTokens,
        solOwners: [ownerByChain.solana],
        computeTokenAccount: true,
        allowError: true,
      })(api);
      await addPublicTvl(api);
      return api.getBalances();
    },
  },
};
