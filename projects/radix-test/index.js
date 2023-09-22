const { getBalances } = require('../helper/chain/radixdlt');

/*
Call the getBalances method with the address of your component
*/

module.exports = {
  radixdlt: {
    tvl: async () => {
      return await getBalances('component_tdx_e_1cq7m3qzds938gxjl8kzryqjke8p9wr4qcn0qmxw3xcvychexuxqmv0')
    },
  },
  timetravel: false
}
