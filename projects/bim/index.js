const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');


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

let _response;

const getVaultBalances = async (chainId, vaults, api) => {
  if (!vaults) {
    throw new Error(`getVaultBalances: undefined vaults passed for ${chainId}`);
  }
  const calls = vaults.map(vault => {
    return api.call({
      abi: {
        inputs: [],
        name: 'balance',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      target: vault.earnedTokenAddress,
    });
  });
  const res = await Promise.all(calls);
  return res;
};

function fetchChain(chain) {
  return async (_, _b, _cb, { api, }) => {
    if (!_response) _response = utils.fetchURL(vaultsEndpoint);
    const vaults = (await _response).data;
    const chainVaults = vaults.filter(vault => vault.chain === chain);

    if( !chainVaults || chainVaults.length === 0) {
      return toUSDTBalances(0);
    }

    const balances = await getVaultBalances(chain, chainVaults, api);
    const tokens = chainVaults.map((vault) => vault.tokenAddress)

    api.add(tokens, balances)
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
