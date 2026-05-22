// Silo V3 deployments
const configV3 = {
  arbitrum: {
    factories: [
      {
        START_BLOCK: 435460074,
        SILO_FACTORY: '0xafd8f792cb025a76c4916652cfc8e20eee3b6fe2',
      },
    ],
  },
  avax: {
    factories: [
      {
        START_BLOCK: 78875406,
        SILO_FACTORY: '0x9e64f0cd206cce2da5de08e7f482d62f57013d0e',
      },
    ],
  },
  ethereum: {
    factories: [
      {
        START_BLOCK: 24527218,
        SILO_FACTORY: '0x1dab4a310447185144467076b116dac7aec3b48f',
      },
    ],
  },
  sonic: {
    factories: [
      {
        START_BLOCK: 63632954,
        SILO_FACTORY: '0xf81d90df1b63d48536e78564d24d5dd8f2be58ad',
      },
    ],
  },
  xdc: {
    factories: [
      {
        START_BLOCK: 100790923,
        SILO_FACTORY: '0xf81d90df1b63d48536e78564d24d5dd8f2be58ad',
      },
    ],
  },
  megaeth: {
    factories: [
      {
        START_BLOCK: 14488088,
        SILO_FACTORY: '0x95a7bc57c738c7f64103b93d04f49cbca566affd',
      },
    ],
  },
}

module.exports = { configV3 }
