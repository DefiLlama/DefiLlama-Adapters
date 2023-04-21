const { nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  kava: [
    {
      tokens: [nullAddress], // KAVA
      holders: [
        "0xCDFfa16631d2b6E78fE9Da3B0454EbF0d2edfFf3", // 100 
        "0xfe79e117875993da3c8332Be34B5F06A55c7d154", // 1000 
        "0x8Bbd79F1E28006D2e7a6B7B29aa46E236F4DFE07", // 10000 
        "0x29d9813881ADB448e9d94ae35a0015c996DB2d40", // 100000 
        "0xD58b5EB926F2Ae88372Bb23C6D432932c705C53F", // 1000000 
      ],
    },
    {
      tokens: ['0xfa9343c3897324496a05fc75abed6bac29f8a40f'],   // USDC
      holders: [
        "0xCDFfa16631d2b6E78fE9Da3B0454EbF0d2edfFf3", // 10 
        "0xfe79e117875993da3c8332Be34B5F06A55c7d154", // 100 
        "0x8Bbd79F1E28006D2e7a6B7B29aa46E236F4DFE07", // 1000 
        "0x29d9813881ADB448e9d94ae35a0015c996DB2d40", // 10000 
        "0xD58b5EB926F2Ae88372Bb23C6D432932c705C53F", // 100000 
      ],
    },
    {
      tokens: ['0x5Ba0Ab8f8E04419b91B0387d1A86FdaE7904B5e6'],   // PRIV
      holders: [
        "0x6Aa0e5a0E753c9620Dfb491C65b281Cb6F1De5e7", // 10 
        "0x71bad84Af58079d14Ba39f8B1D28EcA16A501921", // 100 
        "0x3bB83810eDD5081677B7d818867BDB007D382e64", // 1000 
        "0x8f9A2A8AE7021fbBE62b81e2c6c54844f3F69065", // 10000 
        "0x16Bad1d7A84Bec3c70F8c6c9E8D21fE5FbbBC397", // 100000
      ],
    }    
  ]  
}