const { getBalances } = require('../helper/chain/radixdlt');

/*
Call the getBalances method with the addresses of your components

Note that all the fungible resources within each of the components,
need to be listed in CoinGecko, as that's how the sdk get's the resource value
and calculates the TVL

Radix is using the resource metadata to get the resource name and it uses that name
to pass it to the defillama sdk.

If the resource is not listed on CoinGecko or if the resource name within the resource
metadata does not match the resource name at CoinGecko, then it will not be included in
the TVL report
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
