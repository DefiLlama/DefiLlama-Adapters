module.exports = {
  arbitrum: {
    uniswapV2Vault: {
      doubleContract: '0xBf212dEE0aea6531dEb0B02be6E70b527dDF8246',
      fromBlock: 217487403,
      type: 'v2-vault'
    },
    uniswapV2Migration: {
      doubleContract: '0x1c6E7CE03ae7a9A252BcE0C9F871654dBB0C7ca5',
      fromBlock: 217487754,
      type: 'v2-lp'
    },
    uniswapV3Vault: {
      doubleContract: '0x07116C5ED5cBb49464f64926Ba152B8985fe3AFf',
      fromBlock: 217488144,
      type: 'v3-vault'
    },
    uniswapV3Migration: {
      doubleContract: '0x99F980fa0b1939A0A1033092EF2a668df8D8b70D',
      fromBlock: 217488619,
      type: 'v3-lp'
    },
    assetVault: {
      doubleContract: '0x7C09A9c30736F17043Fe6D0C0A3D03a7Cf6e78FD',
      fromBlock: 217484114,
      type: 'asset-vault'
    },
  }
};
