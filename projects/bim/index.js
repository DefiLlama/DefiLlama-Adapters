const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');

const vaultEndpointBase = 'https://raw.githubusercontent.com/bim-finance-org/staking-vaults/master/';
const chainVaultEndpoints = {
  10: vaultEndpointBase + "optimism.json",
  100: vaultEndpointBase + "gnosis.json",
  137: vaultEndpointBase + "polygon.json",
  8453: vaultEndpointBase + "base.json",
};

const chains = {
  xdai: 100,
  polygon: 137,
  base: 8453,
  optimism: 10,
}

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

function fetchChain(chainId) {
  return async (_, _b, _cb, { api, }) => {

    const chainVaults = utils.fetchURL(chainVaultEndpoints[chainId])
    const vaults = (await chainVaults).data;
    if( !vaults || vaults.length === 0) {
      return toUSDTBalances(0);
    }

    const balances = await getVaultBalances(chainId, vaults, api);
    const tokens = vaults.map((vault) => vault.tokenAddress)

    api.add(tokens, balances)
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  doublecounted: true,
  ...Object.fromEntries(Object.entries(chains).map(chain => [chain[0], {
    tvl: fetchChain(chain[1])
  }]))
}
