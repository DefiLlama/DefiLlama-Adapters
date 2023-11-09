const REAPER_API = "https://2ch9hbg8hh.execute-api.us-east-1.amazonaws.com/dev/api/vaults/";
const { getConfig } = require('../helper/cache');
const { sumERC4626Vaults } = require('../helper/erc4626');
const { sumTokens2 } = require('../helper/unwrapLPs');

module.exports = {
  hallmarks:[
    [1659441956, "$1.7m Exploit"],
  ]
}

const chains = ['optimism', 'arbitrum', 'fantom', 'bsc']

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const hexId = '0x'+ api.chainId.toString(16)
      const {data} = await getConfig('reaper/'+api.chain, REAPER_API + hexId)
      const vaults = Object.values(data).map(i => i.address).filter(i => !['0x85A21D07a3DeEfe58EcD841198D7f774e6444654'].includes(i))
      await sumERC4626Vaults({ api, vaults, abi: { asset: 'address:token', balance: 'uint256:balance' } })
      return sumTokens2({ api, resolveLP: true, })
    }
  }
})