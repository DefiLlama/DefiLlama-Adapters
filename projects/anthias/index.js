const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets deposited in all vaults curated by Anthias Labs.',
  start: '2025-05-27', // https://snapshot.box/#/s:moonwell-governance.eth/proposal/0x38bba3ecc2c5421f7660e124a8d874c70485aec16b2097520cf8fd217efca86d
  blockchains: {
    base: {
      morpho: [
        '0xa0E430870c4604CcfC7B38Ca7845B1FF653D0ff1',
        '0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca',
        '0x543257eF2161176D7C8cD90BA65C2d4CaEF5a796',
        '0xf24608E0CCb972b0b0f4A6446a0BBf58c701a026',
        '0xdbA76Bc542bb07538e046B40F2e8a215B409F7A8',
        '0x89BeDBB1C4837444Da215A377275Ff96A84D6f53',
        '0xbB2F06CeAE42CBcF5559Ed0713538c8892D977c9',
        '0x5083b1387Ec3d4Ee6467B83890D98f1AF93F7c48',
        '0x48a90E85be5C56b0A669985A12ee7C449fC79965',
      ],
    },
  }
}
module.exports = getCuratorExport(configs)
