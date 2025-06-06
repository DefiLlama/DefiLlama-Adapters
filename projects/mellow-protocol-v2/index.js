const axios = require('axios')

const config = {
  ethereum: {
    chainId: 1,
    mellowLrtVaults: [
      '0x5E362eb2c0706Bd1d134689eC75176018385430B',
    ],
  },
  lisk: {
    chainId: 1135,
  }
}

const simpleLrtVaultsApiList = () => 'https://points.mellow.finance/v1/vaults'

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  const { mellowLrtVaults } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (mellowLrtVaults != null && mellowLrtVaults.length > 0) {
        const mellowLrtTvl = await api.multiCall({ abi: 'function underlyingTvl() public view returns (address[] tokens, uint256[] values)', calls: mellowLrtVaults, permitFailure: true })
        mellowLrtTvl.forEach((i) => {
          if (!i) return;
          const { tokens, values } = i
          api.add(tokens, values)
        })
      }

      const simpleLrtVaults = (await axios.get(simpleLrtVaultsApiList())).data.filter(vault => vault.chain_id === config[api.chain].chainId).map(vault => vault.address)
      if (simpleLrtVaults != null && simpleLrtVaults.length > 0) {
        await api.erc4626Sum({ calls: simpleLrtVaults, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets', permitFailure: true });
      }
    }
  }
})