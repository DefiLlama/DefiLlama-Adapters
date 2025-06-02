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

    // assets locked in OFT tokens, bridged to ethereum via layerzero
    // and do staking on ethereum, we count source assets from lisk, don't count on ethereum staking vaults
    interopOFTTokens: [
      '0x1ddBeBd9aaBe4B9660d9Bba5de2949DA1Ae4D229',
      '0x34B22c672b3dA8396f4A66324703590a945129De',
      '0xcDf0b12Ef7716f3848F98D77dD842bFBDCF6b857',
    ],
  }
}

const simpleLrtVaultsApiList = () => 'https://points.mellow.finance/v1/vaults'

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  const { mellowLrtVaults, interopOFTTokens } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (interopOFTTokens && interopOFTTokens.length > 0) {
        const interopTokens = await api.multiCall({ abi: 'function token() public view returns (address)', calls: interopOFTTokens, permitFailure: false })
        const balances = await api.multiCall({
          abi: 'function balanceOf(address owner) public view returns (uint256)',
          calls: interopTokens.map((token, index) => {
            return {
              target: token,
              params: [interopOFTTokens[index]],
            }
          }),
          permitFailure: false,
        })
        api.add(interopTokens, balances)
      }

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