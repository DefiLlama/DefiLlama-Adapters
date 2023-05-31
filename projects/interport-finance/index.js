const { sumTokens2 } = require('../helper/unwrapLPs');
const { staking } = require('../helper/staking');

const usdtVault = '0xEc8DDCb498b44C35EFaD7e5e43E0Caf6D16A66E8';
const usdcVault = '0x5b45B414c6CD2a3341bE70Ba22BE786b0124003F';
const usdcVaultZksync = '0xc724832c5ed81599aE3E4EBC0eC4f87A285B5838';

module.exports = {
  methodology: 'Interport TVL is calculated by summing the USDT and USDC balance of the vaults contracts, ITP token balance in the ITP Revenue Share contract and LP token balance in the LP Revenue Share contract.',
};

['ethereum', 'avax', 'bsc', 'fantom', 'arbitrum', 'polygon'].forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _1, _2, { api }) => {
      const token = await api.call({  abi: 'address:asset', target: usdtVault})
      return sumTokens2({ api, owner: usdtVault, tokens: [token]})
    }
  }
});

['ethereum', 'avax', 'bsc', 'fantom', 'arbitrum', 'polygon'].forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _1, _2, { api }) => {
      const token = await api.call({  abi: 'address:asset', target: usdcVault})
      return sumTokens2({ api, owner: usdtVault, tokens: [token]})
    }
  }
});

['zksync'].forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _1, _2, { api }) => {
      const token = await api.call({  abi: 'address:asset', target: usdcVaultZksync})
      return sumTokens2({ api, owner: usdtVault, tokens: [token]})
    }
  }
})

module.exports.ethereum.staking = staking('0x5DC6796Adc2420BD0f48e05f70f34B30F2AaD313', '0x2b1D36f5B61AdDAf7DA7ebbd11B35FD8cfb0DE31')
module.exports.ethereum.pool2 = staking('0x5F51A04c271C395994F156172cDe451a0188Ca75', '0x152E2502c22F73a7493df8B856836efBc69E3718')
