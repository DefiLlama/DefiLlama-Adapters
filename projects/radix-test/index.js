const { getBalance } = require('../helper/chain/radixdlt');

module.exports = {
  radixdlt: {
    tvl: async () => {
      return {
        radixdlt: await getBalance('component_tdx_e_1cq7m3qzds938gxjl8kzryqjke8p9wr4qcn0qmxw3xcvychexuxqmv0')
      }
    },
  },
  timetravel: false
}
