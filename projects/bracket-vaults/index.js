const ADDRESSES = require('../helper/coreAssets.json')
const CONFIG = {
  brUSDC: '0xb8ca40E2c5d77F0Bc1Aa88B2689dddB279F7a5eb', //  USDC+ Vault
  brETH: '0x3588e6Cb5DCa99E35bA2E2a5D42cdDb46365e71B', // ETH+ Vault
  bravUSDC: '0x9f96E4B65059b0398B922792d3fF9F10B4567533', // Avant+ Vault
  bracketLens: '0xcdc3a8374532Ddb762c76604f30F6a9FDd29082c',
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDC: ADDRESSES.ethereum.USDC
}

const tvl = async (api) => {
  const { brUSDC, brETH, bravUSDC, bracketLens, WETH, USDC } = CONFIG

  const brUSDCTvl = await api.call({
    abi: 'function getTVL(address) external view returns (uint256)',
    target: bracketLens,
    params: [brUSDC],
  });

  api.add(USDC, brUSDCTvl)

  const brETHTvl = await api.call({
    abi: 'function getTVL(address) external view returns (uint256)',
    target: bracketLens,
    params: [brETH],
  });

  api.add(WETH, brETHTvl)

  const bravUSDCVtl = await api.call({
    abi: 'function getTVL(address) external view returns (uint256)',
    target: bracketLens,
    params: [bravUSDC],
  });

  api.add(USDC, bravUSDCVtl)
}

module.exports = {
  doublecounted: true,
  ethereum: { tvl }
}