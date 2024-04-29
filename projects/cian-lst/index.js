const config = {
  ethereum: [
    '0xcDd374F491fBF3f4FcF6E9023c99043774005137',
    '0xB8c0c50D255B93f5276549cbA7F4bf78751A5D34',
    '0x88508306E43FCe43F7f2c1e7D73c88cf6a523f6C',
  ],
  optimism: ['0x907883da917ca9750ad202ff6395C4C6aB14e60E'],
  bsc: ['0xEa5f10A0E612316A47123D818E2b597437D19a17'],
  arbitrum: ['0xE946Dd7d03F6F5C440F68c84808Ca88d26475FC5'],
  base: ['0x9B2316cfe980515de7430F1c4E831B89a5921137'],
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      return api.erc4626Sum({ calls: config[chain], isOG4626: true })
    }
  }
})
