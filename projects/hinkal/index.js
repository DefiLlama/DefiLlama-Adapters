const registryTokensByChain = require("./registryTokens.js");
const registryTokensWithUnderlyingAddressesByChain = require("./registryTokensWithUnderlyingAddresses.js");
const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");
const { sumTokensExport: sumSolanaTokensExport } = require("../helper/solana.js");
const { sumTokensExport } = require("../helper/sumTokens.js");
const { ownersByChain } = require("./owners.js");

const nullAddress = ADDRESSES.null;

const getAllTokenBalances = async (tokenList, chain) => {
  const owners = ownersByChain[chain];

  // One balanceOf call per (token, owner) pair.
  const balanceCalls = tokenList.flatMap((token) =>
    owners.map((owner) => ({ target: token, params: owner }))
  );

  const balances = (
    await sdk.api.abi.multiCall({
      calls: balanceCalls,
      abi: "erc20:balanceOf",
      chain,
      permitFailure: true,
    })
  ).output;

  const tokenBalances = balances
    .filter((bal) => bal.success && Number(bal.output) > 0)
    .map((bal) => ({ address: bal.input.target, balance: bal.output }));

  // Native balance for every owner.
  const nativeBalances = await Promise.all(
    owners.map((owner) =>
      sdk.api.eth.getBalance({ target: owner, chain }).then((r) => r.output)
    )
  );

  nativeBalances.forEach((balance) => {
    if (Number(balance) > 0) tokenBalances.push({ address: nullAddress, balance });
  });

  return tokenBalances;
};

// EVM chains: shielded pool (SHARED_OWNER) + top public proxy wallets. Wrapped
// tokens are mapped to their underlying address so they price correctly.
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

    return {
      address: tokenUnderlyingAddress ? tokenUnderlyingAddress : token.address,
      balance: token.balance,
    };
  });

  api.addTokens(
    mappedTokens.map((token) => token.address),
    mappedTokens.map((token) => token.balance)
  );

  return api.getBalances();
};

module.exports = {
  ethereum: { tvl },
  base: { tvl },
  arbitrum: { tvl },
  optimism: { tvl },
  polygon: { tvl },
  tron: {
    tvl: sumTokensExport({
      owners: ownersByChain.tron,
      tokens: [nullAddress, ...registryTokensByChain.tron],
    }),
  },
  solana: {
    tvl: sumSolanaTokensExport({
      solOwners: ownersByChain.solana,
      computeTokenAccount: true,
      allowError: true,
    }),
  },
};
