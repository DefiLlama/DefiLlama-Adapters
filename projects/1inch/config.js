const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  ethereum: {
    blacklistedTokens: ['0x58730ae0faa10d73b0cddb5e7b87c3594f7a20cb', '0x77777feddddffc19ff86db637967013e6c6a116c',],
    factories: [{
      MooniswapFactory: '0xbaf9a5d4b0052359326a6cdab54babaa3a3a9643',
      fromBlock: 11607841,
    }]
  },
  // polygon: {
  //   factories: [{
  //     MooniswapFactory: '0xbaf9a5d4b0052359326a6cdab54babaa3a3a9643',
  //     fromBlock: 36040621,
  //   }]
  // },
  bsc: {
    factories: [{
      MooniswapFactory: '0xd41b24bba51fac0e4827b6f94c0d6ddeb183cd64',
      fromBlock: 4994614,
    }, {
      MooniswapFactory: '0xbaf9a5d4b0052359326a6cdab54babaa3a3a9643',
      fromBlock: 10588911,
    }],
    blacklistedTokens: [
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.STETH,
      ADDRESSES.ethereum.WBTC,
      ADDRESSES.ethereum.WETH,
      '0x220b71671b649c03714da9c621285943f3cbcdc6',
      '0x875773784af8135ea0ef43b5a374aad105c5d39e',
      '0x1b40183efb4dd766f11bda7a7c3ad8982e998421',
      '0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f',
      ADDRESSES.ethereum.USDT,
      '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85',
      '0x888888888889c00c67689029d7856aac1065ec11',
      '0xe796d6ca1ceb1b022ece5296226bf784110031cd',
      ADDRESSES.ethereum.USDC,
      '0xbb9284484cb9a2bc7950a1276edba2f6358ea677',
      ADDRESSES.ethereum.AAVE,
      '0x9dcae4a9e65bf7925eb7809142f848d3cf8e96ac',
      '0x3fa729b4548becbad4eab6ef18413470e6d5324c',
      '0xcd62b1c403fa761baadfc74c525ce2b51780b184',
      '0x30dcf96a8a0c742aa1f534fac79e99d320c97901',
      '0xfbc4f3f645c4003a2e4f4e9b51077d2daa9a9341',
      '0x18acf236eb40c0d4824fb8f2582ebbecd325ef6a'
    ]
  },
}