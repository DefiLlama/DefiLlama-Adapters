const { getBalances } = require('../helper/chain/radixdlt');

/*
Call the getBalances method with the address of your component
*/

module.exports = {
  radixdlt: {
    tvl: async () => {
      return await getBalances([
        "component_tdx_e_1cradfzdmp76t0gu4ssqpvfx0dj76gv7laskt0ty09wa3kcdfxn279l",
        "component_tdx_e_1cqf0xl4u58wdpxs7juf42w4he2gucks3ptrhhntthg5288hhvsetgd"])
    },
  },
  timetravel: false
}
