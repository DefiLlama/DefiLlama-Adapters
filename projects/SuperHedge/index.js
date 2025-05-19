const ADDRESSES = require('../helper/coreAssets.json')

// Vault configs
const vaults = [
  // BTC Bullish Call-Spread eUSDe
  {
    currency: '0x90d2af7d622ca3141efa4d8f1f24d86e5974cc8f',
    pt: '0x50d2c7992b802eef16c04feadab310f31866a545',
    vault: '0x2324bb9F7d651E0169B9df9194937759E08Acfa9'
  },
  // BTC Bullish Call-Spread lvlUSD
  {
    currency: '0x7c1156e515aa1a2e851674120074968c905aaf37',
    pt: '0x9bca74f805ab0a22ddd0886db0942199a0feba71',
    vault: '0x93c318E595F58E4Ffc8779E35E574832D8d9a5Dc'
  },
  // BTC Bearish Put eUSDe
  {
    currency: '0x90d2af7d622ca3141efa4d8f1f24d86e5974cc8f',
    pt: '0x50d2c7992b802eef16c04feadab310f31866a545',
    vault: '0x9021d933D1Ef4c31550201C8A9522Ab15b3e6d65'
  },
  // BTC Bearish Put lvlUSD
  {
    currency: '0x7c1156e515aa1a2e851674120074968c905aaf37',
    pt: '0x9bca74f805ab0a22ddd0886db0942199a0feba71',
    vault: '0x1fEcD2E54648476bD6AeA2f5B8BBD5155166816e'
  }
]

async function tvl(api) {
  // Process all vaults in a loop
  for (const { currency, pt, vault } of vaults) {
    // Get currency balance
    const currencyBalance = await api.call({
      abi: 'erc20:balanceOf',
      target: currency,
      params: [vault],
    });
    api.add(currency, currencyBalance);
    
    // Get PT token balance
    const ptBalance = await api.call({
      abi: 'erc20:balanceOf',
      target: pt,
      params: [vault],
    });
    api.add(pt, ptBalance);
  }
}

module.exports = {
  methodology: 'Counts the number of stablecoins and PT tokens in the SuperHedge Vault contracts.',
  ethereum: {
    tvl,
  }
};
