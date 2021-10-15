const sdk = require("@defillama/sdk");

const qBnb = "0xbE1B5D17777565D67A5D2793f879aBF59Ae5D351"; // qBNB
const wBnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; //wBNB

const qTokens = [
  "0xd055D32E50C57B413F7c2a4A052faF6933eA7927", // qBTC
  "0xb4b77834C73E9f66de57e6584796b034D41Ce39A", // qETH
  "0x1dd6E079CF9a82c91DaF3D8497B27430259d32C2", // qUSDC
  "0x99309d2e7265528dC7C3067004cC4A90d37b7CC3", // qUSDT
  "0x474010701715658fC8004f51860c90eEF4584D2B", // qDAI
  "0xa3A155E76175920A40d2c8c765cbCB1148aeB9D1", // qBUSD
  "0xaB9eb4AE93B705b0A74d3419921bBec97F51b264", // qCAKE
  "0xFF858dB0d6aA9D3fCA13F6341a1693BE4416A550", //qMDX
  "0xcD2CD343CFbe284220677C78A08B1648bFa39865", // qQBT
];

const tokenAddresses = [
  "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c", //BTCB
  "0x2170ed0880ac9a755fd29b2688956bd959f933f8", //ETH
  "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", //USDC
  "0x55d398326f99059ff775485246999027b3197955", //BSC_USDT
  "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3", //DAI
  "0xe9e7cea3dedca5984780bafc599bd69add087d56", //BUSD
  "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", //CAKE
  "0x9c65ab58d8d978db963e63f2bfb7121627e3a739", //MDX
  "0x17b7163cf1dbd286e262ddc68b553d899b93f526", //QBT
];

async function bsc(timestamp, block, chainBlocks) {
  let balances = {};

  const qBnbBalance = await sdk.api.eth.getBalance({
    target: qBnb,
    block: chainBlocks.bsc,
    chain: "bsc",
  });

  sdk.util.sumSingleBalance(balances, `bsc:${wBnb}`, qBnbBalance.output);

  for (let i = 0; i < qTokens.length; i++) {
    const balance = await sdk.api.erc20.balanceOf({
      target: tokenAddresses[i],
      owner: qTokens[i],
      block: chainBlocks.bsc,
      chain: "bsc",
    });
    sdk.util.sumSingleBalance(
      balances,
      `bsc:${tokenAddresses[i]}`,
      balance.output
    );
  }

  return balances;
}

module.exports = {
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There are multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  misrepresentedTokens: true,
  bsc: {
    tvl: bsc,
  },
  tvl: sdk.util.sumChainTvls([bsc]),
};
