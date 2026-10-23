const utils = require('../helper/utils');
const { unwrapLPsAuto } = require('../helper/unwrapLPs');


const vaultsEndpoint = "https://staking-api.bim.finance/vaults";

const chains = {
    "ethereum": "ethereum",
    "optimism": "optimism",
    "bsc": "bsc",
    "xdai": "gnosis",
    "polygon": "polygon",
    "sonic": "sonic",
    "fraxtal": "fraxtal",
    "hyperliquid": "hyperliquid",
    "base": "base",
    "plasma": "plasma",
    "arbitrum": "arbitrum",
    "avax": "avax",
}

// Tokens without a DefiLlama price, valued through an equivalent CoinGecko asset
const cgFallbacks = {
  base: {
    '0x877014e21c32fea108b6a1f45f367efc9a2d9b9f': { cgId: 'alchemix-usd', decimals: 18 }, // alUSDb
  },
}

let _response;

const getVaultBalances = async (chainId, vaults, api) => {
  if (!vaults) {
    throw new Error(`getVaultBalances: undefined vaults passed for ${chainId}`);
  }
  const calls = vaults.map(vault => {
    return api.call({
      abi: 'uint256:balance',
      target: vault.earnedTokenAddress,
    });
  });
  const res = await Promise.all(calls);
  return res;
};

function fetchChain(chain) {
  return async (api) => {
    if (!_response) _response = utils.fetchURL(vaultsEndpoint);
    const vaults = (await _response).data;
    const chainVaults = vaults.filter(vault => vault.chain === chain);

    if( !chainVaults || chainVaults.length === 0) {
      return {}
    }

    const balances = await getVaultBalances(chain, chainVaults, api);
    const tokens = chainVaults.map((vault) => vault.tokenAddress)

    api.add(tokens, balances)
    // vault want tokens are often AMM LPs (e.g. Aero basic pools) that DefiLlama does not price: value them from their reserves
    await unwrapLPsAuto({ api })

    const fallbacks = cgFallbacks[chain] ?? {}
    for (const [token, { cgId, decimals }] of Object.entries(fallbacks)) {
      const amount = api.getBalances()[`${chain}:${token}`]
      if (!amount) continue
      api.removeTokenBalance(token)
      api.addCGToken(cgId, amount / 10 ** decimals)
    }
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  doublecounted: true,
  ...Object.fromEntries(
    Object.entries(chains).map(chain => [chain[0], {
      tvl: fetchChain(chain[1])
    }]
  ))
}
