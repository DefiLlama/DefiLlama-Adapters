const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
  celo: {
    factory: '0xa431a0bD0978d872C720cD3E3277e31cd6026e90',
    positionManager: '0x3d79EdAaBC0EaB6F08ED885C05Fc0B014290D95A',
  },
  arbitrum: {
    // VaultFactoryArb — a fork of VaultFactory that derives token0/token1
    // ordering from the pool itself instead of assuming Celo's order.
    factory: '0x93590F9a18Ed444dD90ECBeCA094aa9367452472',
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  },
};

async function tvl(api) {
    const { factory, positionManager } = config[api.chain];

    const vaults = await api.fetchList({ target: factory, lengthAbi: 'vaultCount', itemAbi: 'allVaults' });
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
    "Sums, for every vault deployed by AutoRange's VaultFactory/VaultFactoryArb, the vault's idle token0/token1 balances plus the underlying token0/token1 amounts of its open Uniswap V3 concentrated-liquidity position.",
  celo: { tvl },
  arbitrum: { tvl },
};
