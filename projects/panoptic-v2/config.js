const factories = [
  { target: '0x0000000000000aDC9A108591e718F2aee963a2a7', version: 'v3' },
  { target: '0x0000000000000c51d0f8cf4bd9adE7191372a625', version: 'v4' },
]

const sfpms = [
  { target: '0x00000000000005E4693aDc8Ec0f12D686f728198', version: 'v3' },
  { target: '0x00000000000005C3287f136Ef5AF56c68Ea6849f', version: 'v4' },
]

module.exports = {
  ethereum: {
    startBlock: 25276309,
    sfpmStartBlock: 25269999,
    factories,
    sfpms,
    stateView: '0x7ffe42c4a5deea5b0fec41c94c136cf115597227',
    wrappedNative: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    vaults: [
      { address: '0xd4e2c720a760049cc4151bcf61e3a9348db9cd92', fromBlock: 25296736, erc4626s: [] },
      { address: '0x236d0558f06cd60780b232d4ec4c92d2cb7e4d18', fromBlock: 25296782, erc4626s: [] },
      { address: '0x779a2aa634a004b3a3f3b322083744869bbc6d66', fromBlock: 24809033, erc4626s: [] },
      { address: '0x963fe9c93bc353602656ee4051a75114ba74d6c5', fromBlock: 24809057, erc4626s: [] },
    ],
  },
  robinhood: {
    startBlock: 62901925,
    sfpmStartBlock: 62901925,
    factories,
    sfpms,
    stateView: '0xf3334192d15450cdd385c8b70e03f9a6bd9e673b',
    wrappedNative: '0x0bd7d308f8e1639fab988df18a8011f41eacad73',
    vaults: [
      { address: '0x08b24123252bd9c4dd473b6573d4cf67196ffc4b', fromBlock: 63972776, erc4626s: [] },
    ],
  },
}
