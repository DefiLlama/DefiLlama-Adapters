const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const config = {
  blast: {
    weth90d: '0xc932317385fDc794633f612874BD687eA987B151',
    usdb90d: '0x57A6CcB2d5663eF874c29b161dD7907c7673feb0',
    weth90dv2: '0x08B939da28C97aFa6664eC49aD5bE51805ebbb36',
    dusd90dv2: '0xa625B1e6686E8ceADd88aFAC8E44365005C3dbc4',
    wethPointYieldSwap: '0x22597493C61c6d766f78F50A98fBd83f7DE9F6B1',
    dusdPointYieldSwap: '0x1a540c1A1a67bB7dEe573a1BafD30007862bA02b',
  },
}

const wrappedToken = {
  blast: {
    duoEth: '0x1Da40C742F32bBEe81694051c0eE07485fC630f6',
    duoUsd: '0x1A3D9B2fa5c6522c8c071dC07125cE55dF90b253',
  }
}

const wrappedNativeTokenMap = {
  blast: {
    '0x1Da40C742F32bBEe81694051c0eE07485fC630f6': ADDRESSES.blast.fwWETH,
    '0x1A3D9B2fa5c6522c8c071dC07125cE55dF90b253': ADDRESSES.blast.fwUSDB,
  }
}

const usdeVaults = {
  blast: {
    vault: '0xeEa70D690C6c9c5534FcB90b6b0aE71199C7d4d3',
    fwUSDe: '0x04efc000dC9c27445b092622f42e09E173beE61f',
  }
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      let managers = config[chain]
      managers = Object.values(managers)
      const tokens = await api.multiCall({  abi: 'address:TOKEN', calls: managers})
      const vaults = await api.multiCall({  abi: 'address:VAULT', calls: managers})
      const yields = await api.multiCall({  abi: 'uint256:getTotalYield', calls: vaults})
      const principal = await api.multiCall({  abi: 'uint256:principal', calls: managers})
      api.add(tokens, yields)
      api.add(tokens, principal)

      let wrappedTokens = wrappedToken[chain]
      wrappedTokens = Object.values(wrappedTokens)
      const wrappedBalances = await api.multiCall({  abi: 'uint256:totalSupply', calls: wrappedTokens})
      const nativeTokens = wrappedTokens.map(wrappedToken => wrappedNativeTokenMap[chain][wrappedToken])
      api.add(nativeTokens, wrappedBalances);

      let usdeVault = usdeVaults[chain]
      const wrappedUSDeBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: usdeVault.fwUSDe,
        params: usdeVault.vault
      });
      api.add(ADDRESSES.arbitrum.USDe, wrappedUSDeBalance)
      return sumTokens2({ api })
    }
  }
})