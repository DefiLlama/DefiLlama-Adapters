const { sumTokens2 } = require('../helper/unwrapLPs');
const { staking } = require('../helper/staking');

const usdtVault = '0xEc8DDCb498b44C35EFaD7e5e43E0Caf6D16A66E8';
const usdcVault = '0x5b45B414c6CD2a3341bE70Ba22BE786b0124003F';
const usdbVault = '0x5b45B414c6CD2a3341bE70Ba22BE786b0124003F';
const defaultVaults = [usdtVault, usdcVault];
const config = {
  era: { vaults: ['0xc724832c5ed81599aE3E4EBC0eC4f87A285B5838'] },
  base: { vaults: [usdcVault] },
  op_bnb: { vaults: [usdtVault] },
  fantom: { vaults: ['0xd0Adc0cdE959616666c4691985df91C60ca3C0F7', '0xb6AB8EeFAE1a2c22Ca6338E143cb7dE544800c6e'] },
  blast: { vaults: [usdbVault] },
}

module.exports = {
  methodology: 'Interport TVL is calculated by summing the USDT and USDC balance of the vaults contracts, ITP token balance in the ITP Revenue Share contract and LP token balance in the LP Revenue Share contract.',
};

['ethereum', 'avax', 'bsc', 'fantom', 'arbitrum', 'polygon', 'polygon_zkevm', 'base', 'era', 'optimism', 'linea', 'eon', 'op_bnb', 'scroll', 'manta', 'inevm', 'blast'].forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = config[chain]?.vaults || defaultVaults
      const tokens = await api.multiCall({  abi: 'address:asset', calls: vaults })
      return sumTokens2({ api, tokensAndOwners2: [tokens, vaults]})
    }
  }
});

module.exports.ethereum.staking = staking('0x5DC6796Adc2420BD0f48e05f70f34B30F2AaD313', '0x2b1D36f5B61AdDAf7DA7ebbd11B35FD8cfb0DE31')
module.exports.ethereum.pool2 = staking('0x646De66c9A08abF0976869DE259E4B12D06F66ac', '0x4db2C7dd361379134140ffb9D85248e8498008E4')
