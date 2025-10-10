const { staking } = require('../helper/staking');
const { pool2 } = require('../helper/pool2');
const BSC_POOL_DAO = "0x4711D9b50353fa9Ff424ceCa47959dCF02b3725A"


module.exports = {
  methodology: 'TVL counts deposits made to Lossless single asset pools on Ethereum, Heco and Binance Smart Chain and to the various LP farms available on Heco and BSC.',
  ethereum: { tvl: () => ({}) },
  bsc: {
    staking: staking(BSC_POOL_DAO, "0x422e3af98bc1de5a1838be31a56f75db4ad43730"),
    pool2: pool2(BSC_POOL_DAO, "0xf16d5142086dbf7723b0a57b8d96979810e47448"),
    tvl: () => ({})
  },
  heco: {
    staking: () => ({}),
    pool2: () => ({}),
    tvl: () => ({}),
  },
};
