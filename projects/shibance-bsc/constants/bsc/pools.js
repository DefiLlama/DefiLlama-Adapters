const tokens = require("./tokens");

const PoolCategory = {
  'COMMUNITY' :'Community',
  'CORE' : 'Core',
  'BINANCE' : 'Binance', // Pools using native BNB behave differently than pools using a token
  'AUTO' : 'Auto',
}

const pools = [
  {
    sousId: 0,
    stakingToken: tokens.woof,
    earningToken: tokens.woof,
    contractAddress: {
      97: "0x5559C8a6267b0b1bcDe0005a44db0B1546711B76",
      56: "0x4fbEebd68B71aE4367F778129d4218668151EB99",
    },
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: "10",
    sortOrder: 1,
    isFinished: false,
  },
  {
    sousId: 1,
    stakingToken: tokens.woof,
    earningToken: tokens.ass,
    contractAddress: {
      97: "0x1E3C2695Aa1b040a56e9aE7db7E7b2B96125e17A",
      56: "0xb2b694833e0875eA76AF7Fe50800658A41831fcF",
    },
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: "3260302.556",
    sortOrder: 1,
  },
  {
    sousId: 2,
    stakingToken: tokens.woof,
    earningToken: tokens.busd,
    contractAddress: {
      97: "0x4Cad350eA6F1C0010A11aA6b4Df26617A50AD8fF",
      56: "0x52C68033b2eEEFD7b6875b3f9b880a5ccDc51eF7",
    },
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: "0.011574",
    sortOrder: 1,
  },
  {
    sousId: 3,
    stakingToken: tokens.woof,
    earningToken: tokens.cummies,
    contractAddress: {
      97: "0x88f1Ee74eE6727Cb77208A8935261146F9b64293",
      56: "0x2d7831a6C7018dCEF7f9764Bee684B8f7d505222",
    },
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: "0.230902777",
    sortOrder: 1,
  },
  {
    sousId: 4,
    stakingToken: tokens.woof,
    earningToken: tokens.cupcake,
    contractAddress: {
      97: "",
      56: "0xD7a7b01C47497339ECaDcca579492De45bE68A71",
    },
    poolCategory: PoolCategory.CORE,
    harvest: true,
    tokenPerBlock: "1765",
    sortOrder: 2,
  },
];

module.exports = pools;