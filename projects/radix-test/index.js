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
        "component_rdx1crj2jm5l38rht0p9waqer3se3t4932gxxv2e7a40s3pf0h96ea66hp",
        "component_rdx1crjzryv0q7a4vf6h20ugv4lgga8v5duh5wdypd66knexynp9hav4ku"
      ])
    },
  },
  timetravel: false
}
