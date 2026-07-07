const registryTokensByChain = require("./registryTokens.js");
const registryTokensWithUnderlyingAddressesByChain = require("./registryTokensWithUnderlyingAddresses.js");
const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport: sumSolanaTokensExport } = require("../helper/solana.js");
const { sumTokensExport } = require("../helper/sumTokens.js");

const SHARED_OWNER = "0x25e5e82f5702A27C3466fE68f14abDbbAdFca826";
const TRON_VAULT = "TKFUxULu53pSfDkSZwF85PFuKBw1K9axaw";
const SOLANA_VAULT = "HrcpUS1oFVqeNVZxwHZP2fHSiXJWpv4DTN6qyQX4tAJa";

const tvl = async (api) => {
  const chain = api.chain;
  const owners = [SHARED_OWNER];
  const tokens = registryTokensByChain[chain];
  const mapping = registryTokensWithUnderlyingAddressesByChain[chain] || {};

  // ERC20 balances, remapping wrapped tokens to their priceable underlying.
  const calls = tokens.flatMap((token) =>
    owners.map((owner) => ({ target: token, params: owner }))
  );
  const bals = await api.multiCall({ abi: "erc20:balanceOf", calls, permitFailure: true });
  bals.forEach((bal, i) => {
    if (bal && +bal > 0) api.add(mapping[calls[i].target] || calls[i].target, bal);
  });

  // Native balance for the shielded pool; returns the full accumulated set.
  return api.sumTokens({ owners, tokens: [ADDRESSES.null] });
};

module.exports = {
  ethereum: { tvl },
  base: { tvl },
  arbitrum: { tvl },
  optimism: { tvl },
  polygon: { tvl },
  tron: { tvl: sumTokensExport({ owners: [TRON_VAULT], tokens: [ADDRESSES.null, ...registryTokensByChain.tron] }) },
  solana: { tvl: sumSolanaTokensExport({ solOwners: [SOLANA_VAULT], computeTokenAccount: true, allowError: true }) },
};
