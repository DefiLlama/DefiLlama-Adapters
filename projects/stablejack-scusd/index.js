const ADDRESSES = require('../helper/coreAssets.json');
const { getLogs } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { abi: sequencerAbi } = require('./abi/sequencerPool.json'); // Assume you create a local ABI file for totalLocked

const sequencerPools = [
  '0x873B88EDF1d639632DC7D6A734eAdb2Bf18C5bEF',
  '0xeAa3E755d65F34a15c1d461bf54b92b8eFE76c35',
  '0x578296a9A1cf8b84E91ABd101B7c5880b4068678',
];

const tokenMapping = {
  '0xbC10000000000000000000000000000000000001': ADDRESSES.goat.GOAT,    // Goat
  '0xeFEfeFEfeFeFEFEFEfefeFeFefEfEfEfeFEFEFEf': ADDRESSES.goat.BTC,     // BTC
  '0x1E0d0303a8c4aD428953f5ACB1477dB42bb838cf': ADDRESSES.goat.DOGEB,   // Dogeb
  '0xfe41e7e5cB3460c483AB2A38eb605Cda9e2d248E': ADDRESSES.goat.BTCB,    // BTCB
};

const goatTVL = async (api) => {
  const balances = {};

  for (const pool of sequencerPools) {
    const tokens = Object.keys(tokenMapping);

    for (const token of tokens) {
      const locked = await api.call({
        abi: 'function totalLocked(address) view returns (uint256)',
        target: pool,
        params: [token],
      });

      const mapped = tokenMapping[token];
      api.add(mapped, locked);
    }
  }

  return api.getBalances();
};

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL includes scUSD, STS, wOS held in various contracts. Also includes wstkscUSD tokens in the vault, converted to scUSD via convertToAssets(). For Goat chain, tracks totalLocked value from Goat's sequencerPool contracts.",
  sonic: {
    tvl: async (api) => {
      const tokensAndOwners = [
        [ADDRESSES.sonic.scUSD, '0xf41ECda82C54745aF075B79b6b31a18dD986BA4c'],
        [ADDRESSES.sonic.STS, '0x682D7F02BC57Bc64bfb36078454601Ba0Efbe155'],
        ['0x9f0df7799f6fdad409300080cff680f5a23df4b1', '0x0A6F4c98D087445Ef92b589c6f39D22C4373615F'],
        ['0x9fb76f7ce5FCeAA2C42887ff441D46095E494206', '0xb27f555175e67783ba16f11de3168f87693e3c8f'],
      ];
      return api.sumTokens({ tokensAndOwners });
    },
  },
  avax: {
    tvl: async (api) => {
      const tokensAndOwners = [
        ['0xDf788AD40181894dA035B827cDF55C523bf52F67', '0xf010696e0BE614511516bE0DdB89AFf06B6cA440'], // rsAVAX
        ['0x06d47F3fb376649c3A9Dafe069B3D6E35572219E', '0xC37914DacF56418A385a4883512Be8b8279c94C5'], // savUSD
      ];
      return api.sumTokens({ tokensAndOwners });
    },
  },
  goat: {
    tvl: goatTVL,
  },
}; 
