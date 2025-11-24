const CONFIG = {
  vaults: {
    brUSDC: '0xb8ca40E2c5d77F0Bc1Aa88B2689dddB279F7a5eb', //  USDC+ Vault
    brETH: '0x3588e6Cb5DCa99E35bA2E2a5D42cdDb46365e71B', // ETH+ Vault
    bravUSDC: '0x9f96E4B65059b0398B922792d3fF9F10B4567533', // Avant+ Vault
  },
  bracketLens: '0xcdc3a8374532Ddb762c76604f30F6a9FDd29082c',
}

const tvl = async (api) => {
  let { vaults, bracketLens } = CONFIG
  vaults = Object.values(vaults)

  const tokens = await api.multiCall({ abi: 'address:token', calls: vaults })
  const bals = await api.multiCall({ abi: 'function getTVL(address) view returns (uint256)', calls: vaults, target: bracketLens })

  api.add(tokens, bals)
}

module.exports = {
  doublecounted: true,
  ethereum: { tvl }
}