const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by Block Analitica.',
  blockchains: {
    ethereum: {
      morpho: [
        '0x38989BBA00BDF8181F4082995b3DEAe96163aC5D',
        '0x2C25f6C25770fFEC5959D34B94Bf898865e5D6b1',
        '0x186514400e52270cef3D80e1c6F8d10A75d47344',
      ],
    },
    base: {
      morpho: [
        '0xa0E430870c4604CcfC7B38Ca7845B1FF653D0ff1',
        '0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca',
        '0x543257eF2161176D7C8cD90BA65C2d4CaEF5a796',
        '0xf24608E0CCb972b0b0f4A6446a0BBf58c701a026',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
