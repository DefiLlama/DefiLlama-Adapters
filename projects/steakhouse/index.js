const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Steakhouse Financial.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x0000aeB716a0DF7A9A1AAd119b772644Bc089dA8',
        '0x255c7705e8BB334DfCae438197f7C4297988085a',
        '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
        '0xc01Ba42d4Bd241892B813FA8bD4589EAA4C60672',
        '0x7E17eC774beCd5f4f129fA5F150046dD0ECe5BB0', // v2 USDC
        '0x328Dc4A2950b4A19fd440e9ffc6e9c3A496AFCFd', // v2 EURC
        '0xec0Caa2CbAe100CEAaC91A665157377603a6B766'  // v2 USDT/ETH/AUSD
      ],
      mellow: [
        '0xBEEF69Ac7870777598A04B2bd4771c71212E6aBc',
        '0x9707f14B6c8200CBf6c6F2c5498D1D0019A5f15A',
        '0x4C797D53f4772325A8aDFd509F13A2d60Daa7d02',
        '0x5E362eb2c0706Bd1d134689eC75176018385430B',
      ]
    },
    base: {
      morphoVaultOwners: [
        '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
        '0x0000aeB716a0DF7A9A1AAd119b772644Bc089dA8',
        '0x351D76EC45f0aD6Deb498806F1320F75F861a114', // v2 USDC
        '0x8A7cDA8322FB96d3457A5b32C8869A7B1A5b1DB7', // v2 EURC 
        '0x769699C75c4E17ebd5D678A9c58776179DDC254B'  // v2 XSGD 
      ],
    },
    corn: {
      morphoVaultOwners: [
        '0x84ae7f8eb667b391a5ae2f69bd5a0e4b5b77c999',
      ],
    },
    unichain: {
      morphoVaultOwners: [
        '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
      ],
    },
    arbitrum: {
      morphoVaultOwners: [
        '0x0000aeB716a0DF7A9A1AAd119b772644Bc089dA8',
        '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
        '0x0b1aA22117E38f260e0F3aB3b0F12a22c2691ffC' // v2 USDT0/USDC
      ],
    },
    katana: {
      morphoVaultOwners: [
        '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
        '0xe6FC2a011153DD5a230725a9F0c89a9c81aB4887',
      ],
    },
    monad: {
      morphoVaultOwners: [
        '0x0000aeB716a0DF7A9A1AAd119b772644Bc089dA8',
        '0xd546dc0db55c28860176147b2d0fefcc533ecf08',
        '0x2b1D7d0CE2816C83c9bABe48b2FB545488139DCD',
      ],
    },
    polygon: {
      morphoVaultOwners: [
        '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
        '0x0000aeB716a0DF7A9A1AAd119b772644Bc089dA8',
      ],
    },
  }
}
module.exports = getCuratorExport(configs)
