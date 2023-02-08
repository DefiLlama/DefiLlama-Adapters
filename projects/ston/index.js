const { post } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')

function mapTokenAddress(address) {
  switch (address) {
    // ston project use this address to represent TON asset
    // (all zeroes raw address, by analogy with the ethereum null address)
    case 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c':
      return '0x0000000000000000000000000000000000000000';
    default:
      return address;
  }
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async () => {
      const { result: {pools}} = await post('https://app.ston.fi/rpc', {"jsonrpc":"2.0","id":2,"method":"pool.list","params":{}})
      sdk.log(pools.length)

      return transformDexBalances({
        chain: 'ton',
        data: pools.map(i => ({
          token0: mapTokenAddress(i.token0_address),
          token1: mapTokenAddress(i.token1_address),
          token0Bal: i.reserve0,
          token1Bal: i.reserve1,
        }))
      })
    }
  }
}
