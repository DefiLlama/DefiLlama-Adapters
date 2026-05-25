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
        '0xd3e5c0FEB60563dc70ab08B9a7Fdf27B8d04b30b',
        '0x4D7bd498Bb24098Ca281C05519629c605407f71d',
        '0x7E17eC774beCd5f4f129fA5F150046dD0ECe5BB0', // v2 USDC
        '0x328Dc4A2950b4A19fd440e9ffc6e9c3A496AFCFd', // v2 EURC
        '0xec0Caa2CbAe100CEAaC91A665157377603a6B766', // v2 USDT/ETH/AUSD
      ],
      morpho: [
        '0x6cbF3Eed95976D226FFB0bEb09550A9407f47b60', // Steakhouse High Yield ETH
        '0xbeef003E31546C7210687f1A7b40d096BE83ec58', // Steakhouse Prime EURC
        '0xbeef009FF4FB1727297BF2526806F4A73E4b99aD', // Steakhouse Prime frxUSD
        '0xbeef06Fc20699603b995bab8AB03a0592BB4C12f', // Steakhouse Prime Instant tGBP
        '0xbeef0c68466183937a22e1F414E8789a45032302', // Steakhouse Prime Instant tGBP
        '0xBEeFf08E1887A11D91B9Ca68c133c08Ae3c4B44f', // Steakhouse Reservoir rUSD
        '0xbeeff8d3F412A586A204085Cf777867d06763b40', // Steakhouse High Yield wstETH
        '0xbeeff9eBE518d1C7E552c4BbfB99487435c4dEc9', // Steakhouse Resolv USR
        '0xbeeffABcd0dB09589Dd21854aa760C52aB4bf04F', // Steakhouse tGBP
        '0xbeEFfc7b7d0604b4afB92628a8E4B09dc01d008A', // Steakhouse High Yield ETH
        '0xF03C521F3F1D122ffFEF451936D483EAB95BE17c', // Steakhouse Prime frxUSD
        '0xBEEFF0DeaC1aBa71EF0D88C4291354eb92ef4589', // AUSD High Yield Term
        '0xBEEfF0d672ab7F5018dFB614c93981045D4aA98a', // Steakhouse High Yield
        '0xBEEFFF7e4EedD83A4a4aB53A68D03eC77C9a57a8', // AUSD Turbo
        '0xBEEFFF506B52B3323c48aFE0Cb405A284F0f9cF2', // cbBTC Turbo
        '0xBEEFFFcbA46C49A24cfBfFc19166e8f089B59300', // ETH Turbo
        '0xBEeF007ECFBfdF9B919d0050821A9B6DbD634fF0', // Techblock x Steakhouse EURCV
        '0xd8A6511979D9C5D387c819E9F8ED9F3a5C6c5379', // Steakhouse High Yield
        '0xBEEFFFC57A26fD8D3b693Ba025ead597DbECEBfe', // USDC High Yield Term
        '0xBEEf3f3A04e28895f3D5163d910474901981183D', // 3F Ecosystem Vault
        '0xBeefF08dF54897e7544aB01d0e86f013DA354111', // Steakhouse Prime
        '0xBEeFF047C03714965a54b671A37C18beF6b96210', // Steakhouse High Yield
        '0x6f48cE6380693808682E43140E3Eeb877a096Aa1', // USDC T-Prime Instant
        '0xBEEFFF4716a49418D69c251cab8759bB107e57C8', // USDC Turbo
        '0xBEEFFFDE1CABD3d8A3cd4fd5e04DbA51B9D4Ac39', // XAUT Turbo
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
        '0x639bfA26472906Ccd40513408284a8aD292bC5D6',
        '0x351D76EC45f0aD6Deb498806F1320F75F861a114', // v2 USDC
        '0x8A7cDA8322FB96d3457A5b32C8869A7B1A5b1DB7', // v2 EURC
        '0x769699C75c4E17ebd5D678A9c58776179DDC254B', // v2 XSGD
      ],
      morpho: [
        '0xbEeF006fb43820C864894892db0eCFEee3FdF587', // Riva x Steakhouse USDC
        '0xbeEf00890534C736186f3126187Da80c961EdCa1', // Riva x Steakhouse EURC
        '0xbeeff2490FEffa212faC2f6553682C219E6a8845', // Steakhouse High Yield USDC Edition
        '0xBEEFFFdeADc2c172130Ac4C5Ae48c8D4708BFb40', // ETH Turbo
        '0xBeEFDebfaea8350Ce8C4b3a6B7E5FE629c9e27A8', // Steakhouse Morpho V2
        '0xbeEf003c7df2AB8dEF9Fbfc4B233CC13f83D1dA5', // Steakhouse Morpho V2
        '0xBeEF00fc6e87dE086A0e29169A2f6e25cF5C11a9', // Steakhouse Morpho V2
        '0xbeef00b4ebc8094A60006D75B277d30480e0a6D8', // Steakhouse Morpho V2
        '0xBeEF00283d2b26a55F56B9f8c283b25e9a22E95b', // Steakhouse Morpho V2
        '0xBEEff02DE231f8B08c627C769edC73e7AcE47264', // Steakhouse Morpho V2
        '0xBEEFFFe68dFc2D3BD1ABdAd37c70634973b16478', // USDC Turbo
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
        '0xca9f621aAFD28d0F2decFb69Db0d9e6393A9f5ee',
        '0x0b1aA22117E38f260e0F3aB3b0F12a22c2691ffC', // v2 USDT0/USDC
      ],
      morpho: [
        '0xBEEFFF13dD098De415e07F033daE65205B31A894', // USDC Turbo
        '0xBEEFFFFE0E9b26bBe3B5cE851539366991C3BF39', // XAUT0 Turbo
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
      morpho: [
        '0xBEEf0F82E269760429BE6255Fa00821b7e4b592A', // Steakhouse Prime
      ],
    },
    solana: {
      kaminoLendVaultAdmins: [
        '9ceRgz579BcfWogs3RE11FKNQaWW7Lmtnev3MXspxUjF',
      ],
    },
  }
}
module.exports = getCuratorExport(configs)
