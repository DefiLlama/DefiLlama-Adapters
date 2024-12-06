const { call } = require('../helper/chain/near')

const NEAR = '0x136471a34f6ef19fE571EFFC1CA711fdb8E49f2b'

const CONFIG = {
  canto: '0xfb8255f0de21acebf490f1df6f0bdd48cc1df03b',
  ethereum: NEAR,
  near: 'usyc.near'
}

const evmTvl = async (api, token) => {
  const supply = await api.call({ target: token, abi: 'erc20:totalSupply' })
  api.add(NEAR, supply, { skipChain: true })
}

const nonEvmTvl = async (api, token) => {
  const supply = await call(token, 'ft_total_supply', {});
  api.add(NEAR, supply, { skipChain: true })
}

Object.entries(CONFIG).forEach(([chain, address]) => {
  module.exports[chain] = {
    tvl: async (api) => (chain === 'near' ? nonEvmTvl(api, address) : evmTvl(api, address))
  };
});
