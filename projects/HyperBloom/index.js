const { getConfig } = require('../helper/cache')
const { getLogs } = require('../helper/cache/getLogs')
const { yieldHelperPair } = require('../helper/unknownTokens')

const chain = "hyperliquid";

// ICHI-powered vaults built for HyperBloom
const config = {
  hyperliquid: {
    vaultConfigs: [
      { factory: '0xCd952718e6Ef25ac7DBDDd55E501AAA0177dbfA0', fromBlock: 6088464, isAlgebra: false, },
    ],
  },
}

const defaultEvent = 'event ICHIVaultCreated (address indexed sender, address ichiVault, address tokenA, bool allowTokenA, address tokenB, bool allowTokenB, uint24 fee, uint256 count)'
const defaultTopic = '0xde147f43b6837f282eee187234c866cf001806167325f3ea883e36bed0c16a20'

const abi = {
  getTotalAmounts: "function getTotalAmounts() view returns (uint256 total0, uint256 total1)"
}

module.exports = {
  misrepresentedTokens: true,
};

module.exports[chain] = {
  tvl: async (api) => {
    // Beefy
    const pools = await getConfig('hyperbloom', 'https://raw.githubusercontent.com/hyperbloomxyz/vaults.config/refs/heads/master/hyperliquid.json');

    const beefyPools = pools.filter(p => p.platformId === 'beefy');
    const beefyVaults = beefyPools.map(p => p.earnedTokenAddress).filter(Boolean);

    // ICHI
    const { vaultConfigs = []} = config[chain]
    const blacklistedTokens = []
    
    for (const { factory, fromBlock } of vaultConfigs) {
      const logs = await getLogs({ api, target: factory, topics: [defaultTopic], eventAbi: defaultEvent, onlyArgs: true, fromBlock })

      let vaultBalances = []
      const calls = logs.map(l => l.ichiVault)

      vaultBalances = await api.multiCall({ abi: abi.getTotalAmounts, calls, permitFailure: true })

      vaultBalances.forEach((b, i) => {
        if (!b) return
        const { tokenA, tokenB } = logs[i]
        if (!blacklistedTokens.includes(tokenA.toLowerCase())) api.add(tokenA, b.total0)
        if (!blacklistedTokens.includes(tokenB.toLowerCase())) api.add(tokenB, b.total1)
      })
    }

    const beefyBalances = await yieldHelperPair({ vaults: beefyVaults, chain, useDefaultCoreAssets: true });
    
    Object.entries(beefyBalances).forEach(([token, balance]) => {
      api.add(token, balance, { skipChain: true });
    });

    return api.getBalances();
  }
}