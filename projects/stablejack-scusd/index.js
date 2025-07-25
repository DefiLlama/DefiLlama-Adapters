const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

// Goat chain sequencer pool logic
const sequencerPools = [
  '0x873B88EDF1d639632DC7D6A734eAdb2Bf18C5bEF',
  '0xeAa3E755d65F34a15c1d461bf54b92b8eFE76c35',
  '0x578296a9A1cf8b84E91ABd101B7c5880b4068678',
];

// token mapping for Goat sequencer pools
const tokenMapping = {
  '0xbC10000000000000000000000000000000000001': '0xbC10000000000000000000000000000000000001', // Goat
  '0xeFEfeFEfeFeFEFEFEfefeFeFefEfEfEfeFEFEFEf': '0xeFEfeFEfeFeFEFEFEfefeFeFefEfEfEfeFEFEFEf', // BTC
  '0x1E0d0303a8c4aD428953f5ACB1477dB42bb838cf': '0x1E0d0303a8c4aD428953f5ACB1477dB42bb838cf', // Dogeb
  '0xfe41e7e5cB3460c483AB2A38eb605Cda9e2d248E': '0xfe41e7e5cB3460c483AB2A38eb605Cda9e2d248E', // BTCB
}

// goatTVL implementation
async function goatTVL(api) {
  for (const pool of sequencerPools) {
    for (const token of Object.keys(tokenMapping)) {
      const locked = await api.call({
        abi: 'function totalLocked(address) view returns (uint256)',
        target: pool,
        params: [token],
      });

      if (!tokenMapping[token]) return;
if (tokenMapping[token] === undefined) return;
if (tokenMapping[token] === null) return;

api.add(tokenMapping[token], locked.toString());

    }
  }
  return api.getBalances();
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology:
    "TVL includes scUSD, STS, wOS held in various contracts. Also includes wstkscUSD tokens in the vault, converted to scUSD via convertToAssets(). For Goat chain, tracks totalLocked value from Goat's sequencerPool contracts.",
  start: 1719292800, // 2024-06-25 or earlier if needed
  sonic: {
    tvl: async (api) => {
      const tokensAndOwners = [
        [ADDRESSES.sonic.scUSD, '0xf41ECda82C54745aF075B79b6b31a18dD986BA4c'],
        [ADDRESSES.sonic.STS, '0x682D7F02BC57Bc64bfb36078454601Ba0Efbe155'],
        ['0x9f0df7799f6fdad409300080cff680f5a23df4b1', '0x0A6F4c98D087445Ef92b589c6f39D22C4373615F'],
        ['0x9fb76f7ce5FCeAA2C42887ff441D46095E494206', '0xb27f555175e67783ba16f11de3168f87693e3c8f'],
      ];
      return sumTokens2({ api, tokensAndOwners });
    },
  },
  avax: {
    tvl: async (api) => {
      const tokensAndOwners = [
        ['0xDf788AD40181894dA035B827cDF55C523bf52F67', '0xf010696e0BE614511516bE0DdB89AFf06B6cA440'], // rsAVAX
        ['0x06d47F3fb376649c3A9Dafe069B3D6E35572219E', '0xC37914DacF56418A385a4883512Be8b8279c94C5'], // savUSD
      ];
      return sumTokens2({ api, tokensAndOwners });
    },
  },
  goat: {
    tvl: goatTVL,
  },
};
