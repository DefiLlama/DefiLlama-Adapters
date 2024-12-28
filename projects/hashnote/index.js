const { call } = require('../helper/chain/near')
const { get } = require("../helper/http");

const USYC = '0x136471a34f6ef19fE571EFFC1CA711fdb8E49f2b'

const CONFIG = {
  canto: '0xfb8255f0de21acebf490f1df6f0bdd48cc1df03b',
  ethereum: USYC,
  near: 'usyc.near',
  noble: 'uusyc'
}

const evmTvl = async (api, token) => {
  const supply = await api.call({ target: token, abi: 'erc20:totalSupply' })
  api.add(USYC, supply, { skipChain: true })
}

const nonEvmTvl = async (api, token) => {
  const supply = await call(token, 'ft_total_supply', {});
  api.add(USYC, supply, { skipChain: true });
}

const nobleTvl = async (api, token) => {
  const res = await get(`https://rest.cosmos.directory/noble/cosmos/bank/v1beta1/supply/by_denom?denom=${token}`);
  api.add(USYC, parseInt(res.amount.amount), { skipChain: true });
}

Object.entries(CONFIG).forEach(([chain, address]) => {
  module.exports[chain] = {
    tvl: async (api) => {
      if (chain === 'near') {
        return nonEvmTvl(api, address);
      } else if (chain === 'noble') {
        return nobleTvl(api, address);
      } else {
        return evmTvl(api, address);
      }
    }
  };
});