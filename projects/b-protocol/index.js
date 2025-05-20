const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by B protocol.',
  blockchains: {
    ethereum: {
      morpho: [
        '0x0F359FD18BDa75e9c49bC027E7da59a4b01BF32a',
        '0x38989BBA00BDF8181F4082995b3DEAe96163aC5D',
        '0x2C25f6C25770fFEC5959D34B94Bf898865e5D6b1',
        '0x45c1875F1C48622b3D9740Af2D7dc62Bc9a72422',
        '0x186514400e52270cef3D80e1c6F8d10A75d47344',
        '0xB9C9158aB81f90996cAD891fFbAdfBaad733c8C6',
      ],
    },
    base: {
      morpho: [
        '0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca',
        '0xa0E430870c4604CcfC7B38Ca7845B1FF653D0ff1',
        '0x543257eF2161176D7C8cD90BA65C2d4CaEF5a796',
        '0xf24608E0CCb972b0b0f4A6446a0BBf58c701a026',
        '0x70F796946eD919E4Bc6cD506F8dACC45E4539771',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
