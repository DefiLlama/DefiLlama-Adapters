const registryTokensByChain = require("./registryTokens.js");
const registryTokensWithUnderlyingAddressesByChain = require("./registryTokensWithUnderlyingAddresses.js");
const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport: sumSolanaTokensExport } = require("../helper/solana.js");
const { sumTokensExport } = require("../helper/sumTokens.js");

const SHARED_OWNERS = [
  "0x25e5e82f5702A27C3466fE68f14abDbbAdFca826",
  "0x7cb60446d7635C68EDf1c568cac74A1f98c1Cfa4",
];
const TRON_VAULTS = ["TDybyktjKwcuLdcuroUJABT7pQE5WDYeqa", "TKFUxULu53pSfDkSZwF85PFuKBw1K9axaw"];
const SOLANA_VAULTS = ["8WMX4EvePEjLnzkcrDRhHFftLLAH7gRK2XUwMJeYNhpn", "HrcpUS1oFVqeNVZxwHZP2fHSiXJWpv4DTN6qyQX4tAJa"];

const tvl = async (api) => {
  const chain = api.chain;
  const owners = SHARED_OWNERS;
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
  // Arc's native USDC is the same balance as the ERC20 at 0x3600..., which is already counted above.
  if (chain === "arc") return api.getBalances();
  return api.sumTokens({ owners, tokens: [ADDRESSES.null] });
};

module.exports = {
  ethereum: { tvl },
  base: { tvl },
  arbitrum: { tvl },
  polygon: { tvl },
  bsc: { tvl },
  tempo: { tvl },
  robinhood: { tvl },
  arc: { tvl },
  tron: { tvl: sumTokensExport({ owners: TRON_VAULTS, tokens: [ADDRESSES.null, ...registryTokensByChain.tron] }) },
  solana: { tvl: sumSolanaTokensExport({ owners: SOLANA_VAULTS, tokens: registryTokensByChain.solana, solOwners: SOLANA_VAULTS, computeTokenAccount: true, allowError: true }) },
};
