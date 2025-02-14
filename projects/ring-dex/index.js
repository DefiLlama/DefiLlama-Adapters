const { uniTvlExport } = require('../helper/calculateUniTvl')

module.exports = {
    ethereum: {
        tvl: uniTvlExport('0xeb2A625B704d73e82946D8d026E1F588Eed06416', 'ethereum', false),
      },
    blast: {
      tvl: uniTvlExport('0x24F5Ac9A706De0cF795A8193F6AB3966B14ECfE6', 'blast', false),
    },
    base: {
      tvl: uniTvlExport('0x9BfFC3B30D6659e3D84754cc38865B3D60B4980E', 'base', false),
    },
    arbitrum: {
      tvl: uniTvlExport('0x1246Fa62467a9AC0892a2d2A9F9aafC2F5609442', 'arbitrum', false),
    },
}
