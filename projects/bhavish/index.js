const { nullAddress, sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  polygon: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [nullAddress, '0x83Bfcd4a0BF6f442CA62a6f68E7f6CecF5C01D1d'], 
        [nullAddress, '0x4A3ad4bB1A1b7CeE02E30F9f41d99985eA7A1E56'], 
        [nullAddress, '0xA59e8042b8199fB21913AE3b96178e15eF96bAc3'], 
        [nullAddress, '0x7768b73f95d5d5f77aad6cd3cD47591a6565F75D'], 
        [nullAddress, '0x747E2D83B5DaB11bD5351890D54e3944272aBDb9'], 
        [nullAddress, '0x3bc0D5A68f5b77497150cDbdB6f54DF64dD46Af2'], 
      ]
    }),
  },
  mantle: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [nullAddress, '0xca0112597B795728d0aFC33dB2E3eD56D95F624d'],
      ]
    }),
  }
}