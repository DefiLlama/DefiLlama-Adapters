const { sumTokens2 } = require('../helper/unwrapLPs');

// Each chain can have multiple vault-factory lines live with real capital at
// once: the original "standard" factory, the audited "official" compound-
// interest line users are migrating capital to, and — on Arbitrum/Robinhood
// — older intermediate compound versions (V5/V8/V9) that still hold real
// vaults and were never migrated, so they can't be dropped from TVL.
const config = {
  celo: [
    '0xa431a0bD0978d872C720cD3E3277e31cd6026e90', // standard
    '0x788F29180636f6A075e81F8935aA1914aB51Bb64', // official (compound)
  ],
  arbitrum: [
    '0x93590F9a18Ed444dD90ECBeCA094aa9367452472', // standard
    '0x288B7d7cD81620977062aa6eEdA2a64D93386502', // official (compound)
    '0xfd6Ee65CE2501753216066dcB58EF12c5f5CB6ee', // legacy compound V5
    '0xdCDD4d1b63c60A56C0E4FD5584948069eceedef7', // legacy compound V8
    '0x80Fe1F70FDc272CAd6db179a5f691A169AA48636', // legacy compound V9
  ],
  robinhood: [
    '0x58111317A2920F8b40fd9A5a7596c105530B425e', // official (compound)
    '0xFb78eC2DeEF1aBEe421E981A239ae949Ae4E26B2', // legacy compound V8
  ],
  base: [
    '0x7De099A8BdABcE2680160aF2c2bF11336f99c3F1', // official (compound)
  ],
};

async function tvl(api) {
  const factories = config[api.chain];

  const vaultLists = await Promise.all(
    factories.map((factory) => api.fetchList({ target: factory, lengthAbi: 'vaultCount', itemAbi: 'allVaults' })),
  );
  const vaults = vaultLists.flat();
  if (!vaults.length) return;

  const [token0s, token1s] = await Promise.all([
    api.multiCall({ calls: vaults, abi: 'address:token0' }),
    api.multiCall({ calls: vaults, abi: 'address:token1' }),
  ]);

  const ownerTokens = vaults.map((v, i) => [[token0s[i], token1s[i]], v]);

  await sumTokens2({ api, ownerTokens, owners: vaults, resolveUniV3: true });
}

module.exports = {
  methodology:
    "Sums every vault ever created across AutoRange's standard factories, its audited compound-interest \"official\" line (which users are actively migrating capital to), and earlier compound versions still holding real capital — each vault's idle token0/token1 balances plus its open Uniswap V3 position's underlying amounts.",
  celo: { tvl },
  arbitrum: { tvl },
  robinhood: { tvl },
  base: { tvl },
};
