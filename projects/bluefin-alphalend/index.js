const { getDynamicFieldObjects, getObjects } = require('../helper/chain/sui');

const MARKETS_CONTAINER = '0x2326d387ba8bb7d24aa4cfa31f9a1e58bf9234b097574afb06c5dfb267df4c2e';

// no borrow
const blacklistedCoins = [
  '0x89b0d4407f17cc1b1294464f28e176e29816a40612f7a553313ea0a797a5f803::ethird::ETHIRD',
  '0x8a398f65f8635be31c181632bf730aea25074505d70c77d9b287e7d4f063ef70::ewal::EWAL',
  '0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL',
  '0x244b98d29bd0bba401c7cfdd89f017c51759dad615e15a872ddfe45af079bb1d::ebtc::EBTC',
  '0x56589f5381303a763a62e79ac118e5242f83652f4c5a9448af75162d8cb7140c::exbtc::EXBTC',
  '0x66629328922d609cf15af779719e248ae0e63fe0b9d9739623f763b33a9c97da::esui::ESUI',
]

async function tvl(api) {
  const marketData = await getDynamicFieldObjects({
    parent: MARKETS_CONTAINER,
    idFilter: (i) => i.objectType.includes('::market::Market'),
  });

  for (const market of marketData) {
    const { fields } = market;
    if (!fields) continue;

    const coinType = "0x" + fields.value.fields.coin_type.fields.name;
    if (!blacklistedCoins.includes(coinType)) {
      const balance = Number(fields.value.fields.balance_holding);
      api.add(coinType, balance);
    }
  }
}
async function borrowed(api) {
  const marketData = await getDynamicFieldObjects({
    parent: MARKETS_CONTAINER,
    idFilter: (i) => i.objectType.includes('::market::Market'),
  });

  for (const market of marketData) {
    const { fields } = market;
    if (!fields) continue;

    const coinType = "0x" + fields.value.fields.coin_type.fields.name;
    if (!blacklistedCoins.includes(coinType)) {
      const borrowed = Number(fields.value.fields.borrowed_amount);
      api.add(coinType, borrowed);
    }
  }
}

module.exports = {
  sui: {
    tvl: tvl,
    borrowed: borrowed,
  },
  hallmarks: [
    ['2025-05-07', 'AlphaLend Launched'],
  ],
};
