const { nullAddress } = require('../helper/tokenMapping');
const { get } = require('../helper/http')


async function bsctvl(timestamp, block, chainBlocks, { api }) {
  const bal = await api.call({ abi: 'function exchangeRate() external view returns (uint256 totalWei, uint256  poolTokenSupply)', target: '0xc228cefdf841defdbd5b3a18dfd414cc0dbfa0d8' })

  return {
    ['bsc:' + nullAddress]: bal.totalWei
  };
}

module.exports = {
  methodology: `We get the totalSupply of the constituent token contracts (like stkATOM, pATOM, stkXPRT, pXPRT, stkBNB etc.) and then we multiply it with the USD market value of the constituent token`,
  bsc: {
    tvl: bsctvl
  },
  persistence: {
    tvl: async () => {
      const api = 'https://api.persistence.one/pstake/stkatom/atom_tvu'
      return {
        'cosmos:uatom': (await get(api)).amount.amount
      }
    }
  }
};
