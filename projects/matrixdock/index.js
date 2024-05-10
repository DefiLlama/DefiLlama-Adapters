const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: async (api) => {
      const STBT = '0x530824DA86689C9C17CdC2871Ff29B058345b44a'
      api.add(ADDRESSES.ethereum.USDT, await api.call({ target: '0xad4A9bED9a5E2c1c9a6E43D35Db53c83873dd901', abi: 'uint256:latestAnswer'}) / 1e12)
    }
  }
}