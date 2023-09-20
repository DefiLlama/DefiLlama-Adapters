const { getLogs } = require('../helper/cache/getLogs')
const config = {
  polygon: { registry: '0x24825b3c44742600d3995d1d3760ccee999a7f0b', fromBlock: 41535540, },
  arbitrum: { registry: '0x9f5b097AD23e2CF4F34e502A3E41D941678877Dc', fromBlock: 88698956, },
  optimism: { registry: '0xC1Ecd10398A6D7036CceE1f50551ff169715081c', fromBlock: 96971465, },
  avax: { registry: '0x9f5b097AD23e2CF4F34e502A3E41D941678877Dc', fromBlock: 30434642, },
  bsc: { registry: '0x31e4ee367d4f2685BAfcAb9566e9C87E60D48983', fromBlock: 28461459, },
  evmos: { registry: '0xD90c8970708FfdFC403bdb56636621e3E9CCe921', fromBlock: 13671900, },
  metis: { registry: '0x116Dba5DcE9CcDA828218b7eB46406810632014C', fromBlock: 6067741, },
  polygon_zkevm: { registry: '0x9f5b097AD23e2CF4F34e502A3E41D941678877Dc', fromBlock: 1022413, },
  celo: { registry: '0x116Dba5DcE9CcDA828218b7eB46406810632014C', fromBlock: 19813127, },
  thundercore: { registry: '0xa1Dd21fbd9e1F0BF28d41F18bDC22326e50C02e9', fromBlock: 135181847, },
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { registry, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: registry,
        topic: "VaultCreated(address,address,string,uint256,address)",
        eventAbi: 'event VaultCreated(address deployer, address vault, string beaconName, uint256 indexed tokenId, address vaultManager)',
        onlyArgs: true,
        fromBlock,
      })
      const vaults = logs.map(log => log.vault)
      const bals = await api.multiCall({ abi: "function getTotalAmounts() view returns (uint256 total0, uint256 total1)", calls: vaults, permitFailure: true, })
      const token0s = await api.multiCall({ abi: "address:token0", calls: vaults, permitFailure: true, })
      const token1s = await api.multiCall({ abi: "address:token1", calls: vaults, permitFailure: true, })
      bals.forEach((bal, i) => {
        const token0 = token0s[i]
        const token1 = token1s[i]
        if (!bal || !token0 || !token1) return // skip failures
        api.add(token0, bal.total0)
        api.add(token1, bal.total1)
      })
      return api.getBalances()
    }
  }
})