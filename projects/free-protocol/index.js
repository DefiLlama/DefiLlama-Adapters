const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  merlin: {
    tvl: sumTokensExport({
      owners: [
        '0xA6E02b4445dB933FCD125a449448326d6505B189',
        '0x79af88101aB5589aB0f92a2bbAbe2bAe1c602806',
        '0xD5f051fF82D90D086B57842e6Aae8f2FAa80Cb1c',
        '0xE12382e046DB998DE89aF19Ca799CbB757106781',
      ],
      tokens: [
        ADDRESSES.merlin.WBTC_1,
        '0xC5BD913eE3BEFD4721C609177F29a8770ACD7242',
        '0x41D9036454BE47d3745A823C4aaCD0e29cFB0f71',
      ],
    }),
  },
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        '0x1B5668Ca8edfC8AF5DcB9De014b4B08ed5d0615F',
        '0x3111653DB0e7094b111b8e435Df9193b62C2C576',
        '0xd6572c7cd671ecf75d920adcd200b00343959600',
        '0xa97Fe3E9c1d3Be7289030684eD32A6710d2d02bA',
        '0xeea3A032f381AB1E415e82Fe08ebeb20F513c42c',
      ],
      tokens: [
        ADDRESSES.ethereum.USDC,
        '0x7122985656e38bdc0302db86685bb972b145bd3c',
        ADDRESSES.ethereum.USDT,
        '0x7122985656e38BDC0302Db86685bb972b145bD3C',
      ]
    })
  },
  arbitrum: {
    tvl: sumTokensExport({
      owners: [
        '0xC178AE294bC3623e6dfDF07C9ca79c6dB692f032',
        '0xBA43F3C8733b0515B5C23DFF46F47Af6EB46F85C',
      ],
      tokens: [
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.arbitrum.USDC_CIRCLE,
      ]
    })
  },
  manta: {
    tvl: sumTokensExport({
      owners: [
        '0x19727db22Cba70B1feE40337Aba69D83c6741caF',
      ],
      tokens: [
        ADDRESSES.berachain.STONE,
      ]
    })
  },
  bsc: {
    tvl: sumTokensExport({
      owners: [
        '0x40a25786937eCc0643e78ca40Df02Db4dff27bb0',
        '0xF8aeD4da2598d3dF878488F40D982d6EcC8B13Ad',
        '0xBA43F3C8733b0515B5C23DFF46F47Af6EB46F85C',
        '0x0A80028d73Faaee6e57484E3335BeFda0de7f455',
      ],
      tokens: [
        ADDRESSES.ethereum.FDUSD,
        ADDRESSES.bsc.BTCB,
        ADDRESSES.ethereum.FDUSD,
        '0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7',
      ]
    })
  },
  polygon: {
    tvl: sumTokensExport({
      owners: [
        '0x7Ab202c0161357Ca4C8FD2E09AdFcD45F3aAfb41',
      ],
      tokens: [
        '0x4f64a90409b8361cde7c3103e87e9c8511501c5a',
        '0x57912d26a5285bc5d614bbf4e9be0e42406ede54',
      ]
    })
  },
  kroma: {
    tvl: () => ({})
  },
  hemi: {
    tvl: sumTokensExport({
      owners: [
        '0x25aB3Efd52e6470681CE037cD546Dc60726948D3',
      ],
      tokens: [
        '0xF469fBD2abcd6B9de8E169d128226C0Fc90a012e',
        '0x9BFA177621119e64CecbEabE184ab9993E2ef727',
        '0xF9775085d726E782E83585033B58606f7731AB18',
        '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e',
        ADDRESSES.goat.uBTC,
      ]
    })
  }
};