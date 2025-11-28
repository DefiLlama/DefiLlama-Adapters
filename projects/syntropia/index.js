const config = {
  ethereum: {
    vaults: [
      "0x1b2cb79a4564206f53ba80b4d780f251b4ae6765",
      "0xd17049ed25d8f99fe3bfd10cef2263da9995cfd8",
      "0x8df3deba711ae4a9af16cbca5e4fbb1402f036d5"
    ]
  }
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: `
The methodology for calculating TVL includes value of all assets in Syntropia strategies expressed in USDC
  `.trim(),
};


Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: (api) => api.erc4626Sum({ calls: config[chain].vaults, tokenAbi: 'asset', balanceAbi: 'totalAssets' })
  }
})