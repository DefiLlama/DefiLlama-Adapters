

module.exports = {
  timetravel: false,
  krest: {
    tvl: async () => {
	  const { krest } = getExports("krest-staking", ['krest'])
	  const tvl = await krest.tvl()
	  return { 'bifrost-native-coin': tvl['bifrost-native-coin'], polkadot: tvl.polkadot, kusama: tvl.kusama, moonbeam: tvl.moonbeam, moonriver: tvl.moonriver, }
	}
  },
}; 
