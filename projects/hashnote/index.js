const { call } = require('../helper/chain/near')
const { get } = require("../helper/http");

const CONFIG = {
  ethereum: '0x136471a34f6ef19fE571EFFC1CA711fdb8E49f2b',
  bsc: "0x8D0fA28f221eB5735BC71d3a0Da67EE5bC821311",
  near: 'usyc.near',
  noble: 'uusyc'
}

const USYC = CONFIG.ethereum

const ethTvl = async (api, token) => {
  const supply = await api.call({ target: token, abi: 'erc20:totalSupply' })
  api.add(USYC, supply, { skipChain: true })
}

const bscTvl = async (api, token) => {
  const supply = await api.call({ target: token, abi: 'erc20:totalSupply' })
  api.add(USYC, supply, { skipChain: true })
}

const nearTvl = async (api, token) => {
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
      if (chain === 'bsc') {
        return bscTvl(api, address);
      } else if (chain === 'near') {
        return nearTvl(api, address);
      } else if (chain === 'noble') {
        return nobleTvl(api, address);
      } else {
        return ethTvl(api, address);
      }
    }
  };
});