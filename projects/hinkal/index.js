const registryTokensByChain = require("./registryTokens.js");
const registryTokensWithUnderlyingAddressesByChain = require("./registryTokensWithUnderlyingAddresses.js");
const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport: sumSolanaTokensExport } = require("../helper/solana.js");
const { sumTokensExport } = require("../helper/sumTokens.js");

const SHARED_OWNER = "0x7cb60446d7635C68EDf1c568cac74A1f98c1Cfa4";
const OWNER_BY_CHAIN = {
  ethereum: SHARED_OWNER,
  base: SHARED_OWNER,
  arbitrum: SHARED_OWNER,
  polygon: SHARED_OWNER,
  bsc: SHARED_OWNER,
  tempo: SHARED_OWNER,
  optimism: "0x25BBb093BA3cB978a5C00C31fFaC8Fdc343535cF",
};
const TRON_VAULT = "TDybyktjKwcuLdcuroUJABT7pQE5WDYeqa";
const SOLANA_VAULT = "8WMX4EvePEjLnzkcrDRhHFftLLAH7gRK2XUwMJeYNhpn";

const tvl = async (api) => {
  const chain = api.chain;
  const owners = [OWNER_BY_CHAIN[chain]];
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
  bsc: { tvl },
  tempo: { tvl },
  tron: { tvl: sumTokensExport({ owners: [TRON_VAULT], tokens: [ADDRESSES.null, ...registryTokensByChain.tron] }) },
  solana: { tvl: sumSolanaTokensExport({ solOwners: [SOLANA_VAULT], computeTokenAccount: true, allowError: true }) },
};
