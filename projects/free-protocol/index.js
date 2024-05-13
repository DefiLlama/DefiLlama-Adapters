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
        '0xB880fd278198bd590252621d4CD071b1842E9Bcd',
        '0xC5BD913eE3BEFD4721C609177F29a8770ACD7242',
        '0x41D9036454BE47d3745A823C4aaCD0e29cFB0f71',
        '0x41D9036454BE47d3745A823C4aaCD0e29cFB0f71',
      ],
    }),
  },
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        '0xd6572c7cd671ecf75d920adcd200b00343959600',
        '0xa97Fe3E9c1d3Be7289030684eD32A6710d2d02bA',
        '0xeea3A032f381AB1E415e82Fe08ebeb20F513c42c',
      ],
      tokens: [
        '0x7122985656e38bdc0302db86685bb972b145bd3c',
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
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
        '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      ]
    })
  },
  manta: {
    tvl: sumTokensExport({
      owners: [
        '0x19727db22Cba70B1feE40337Aba69D83c6741caF',
      ],
      tokens: [
        '0xEc901DA9c68E90798BbBb74c11406A32A70652C3',
      ]
    })
  },
  bsc: {
    tvl: sumTokensExport({
      owners: [
        '0xBA43F3C8733b0515B5C23DFF46F47Af6EB46F85C',
        '0x0A80028d73Faaee6e57484E3335BeFda0de7f455',
      ],
      tokens: [
        '0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409',
        '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
        '0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409',
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
};