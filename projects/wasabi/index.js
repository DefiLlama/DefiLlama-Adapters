const { getLogs } = require('../helper/cache/getLogs');

const config = {
  ethereum: {
    pools: {
      "WASABI_LONG_POOL": "0x8e0edfd6d15f858adbb41677b82ab64797d5afc0",
      "WASABI_SHORT_POOL": "0x0fdc7b5ce282763d5372a44b01db65e14830d8ff"
    }, fromBlock: 18810700,
  },
  blast: {
    pools: {
      "WASABI_LONG_POOL": "0x046299143A880C4d01a318Bc6C9f2C0A5C1Ed355",
      "WASABI_SHORT_POOL": "0x0301079DaBdC9A2c70b856B2C51ACa02bAc10c3a"
    }, fromBlock: 185200,
  },
}


Object.keys(config).forEach(chain => {
  let { pools, fromBlock, tokens = [], } = config[chain]
  pools = Object.values(pools)
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = (await Promise.all(pools.map(target => getLogs({
        api,
        target,
        eventAbi: "event NewVault(address indexed pool, address indexed asset, address vault)",
        onlyArgs: true,
        fromBlock,
      })))).flat();
      return api.erc4626Sum({ calls: logs.map(log => log.vault), isOG4626: true, });
    }
  }
})