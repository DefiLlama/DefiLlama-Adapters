const axios = require('axios');
const BigNumber = require('bignumber.js');

const apiUrl = 'https://amberfi-backend.prod.mars-dev.net/v2/redbank_markets_data?chain=neutron&days=1';

const assets = [
  {
    denom:
      "ibc/2EB30350120BBAFC168F55D0E65551A27A724175E8FBCC7B37F9A71618FE136B",
    symbol: "FBTC",
    decimals: 8,
  },
  {
    denom:
      "ibc/B7BF60BB54433071B49D586F54BD4DED5E20BEFBBA91958E87488A761115106B",
    symbol: "LBTC",
    decimals: 8,
  },
  {
    denom:
      "ibc/C0F284F165E6152F6DDDA900537C1BC8DA1EA00F03B9C9EC1841FA7E004EF7A3",
    symbol: "solvBTC",
    decimals: 18,
  },
  {
    denom:
      "ibc/E2A000FD3EDD91C9429B473995CE2C7C555BCC8CFC1D0A3D02F514392B7A80E8",
    symbol: "eBTC",
    decimals: 8,
  },
  {
    denom:
      "ibc/1075520501498E008B02FD414CD8079C0A2BAF9657278F8FB8F7D37A857ED668",
    symbol: "pumpBTC",
    decimals: 8,
  },
  {
    denom:
      "ibc/3F1D988D9EEA19EB0F3950B4C19664218031D8BCE68CE7DE30F187D5ACEA0463",
    symbol: "uniBTC",
    decimals: 8,
  },
  {
    denom:
      "ibc/0E293A7622DC9A6439DB60E6D234B5AF446962E27CA3AB44D0590603DFF6968E",
    symbol: "wBTC",
    decimals: 8,
  },
]


async function tvl(api) {
  const marketStatsData = await axios.get(apiUrl);
  if(marketStatsData.status !== 200) return;

  const marketStats = marketStatsData.data.data[0].markets ?? [];
  if(marketStats.length === 0) return;
  marketStats.forEach((market) => {
    const asset = assets.find((asset) => asset.denom === market.denom);
    if(!asset) return;
    const depositAmount = BigNumber(market.deposit_amount).shiftedBy(asset.decimals);
    const borrowAmount = BigNumber(market.borrow_amount).shiftedBy(asset.decimals);
    api.add(market.denom,  depositAmount.minus(borrowAmount).integerValue(BigNumber.ROUND_DOWN).toString());
  });
}

module.exports = {
  timetravel: false,
  methodology: "Sum token balances by querying the total deposit amount for each asset from the market stats api.",
  neutron: { tvl },
  hallmarks: [
    [1756303200, 'Launch on Neutron'],
  ],
};
