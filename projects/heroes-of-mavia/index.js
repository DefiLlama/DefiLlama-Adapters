const { staking } = require('../helper/staking')

const contracts = {
  stakingPools: {
    ethereum: "0xF2f8D915a4F28Cdb52cbe8F56ecc0f8AE3def54A",
    base: "0x21890f88fc8A8b0142025935415017adA358C8C0",
  },
  marketPool: {
    base: "0xecc312CBDC0884C41FE1579ea33686DdAcc90c42",
  },
};

const tokens = {
  ethereum: {
    MAVIA: "0x24fcFC492C1393274B6bcd568ac9e225BEc93584",
  },
  base: {
    MAVIA: "0x24fcFC492C1393274B6bcd568ac9e225BEc93584",
  },
};

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking(contracts.stakingPools.ethereum, tokens.ethereum.MAVIA),
  },
  base: {
    staking: staking([contracts.stakingPools.base, contracts.marketPool.base], tokens.base.MAVIA),
  },
};