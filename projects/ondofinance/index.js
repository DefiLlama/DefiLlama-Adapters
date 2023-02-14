const sdk = require("@defillama/sdk");

const funds = [
  { address: "0x1B19C19393e2d034D8Ff31ff34c81252FcBbee92", decimals: 18 }, // OUSG
];

const tvlForAllFunds = funds.map((fund) => async (timestamp, block) => ({
  [fund.address]: (
    await sdk.api.erc20.totalSupply({
      block,
      target: fund.address,
      chain: "ethereum",
    })
  ).output,
}));

module.exports = {
  methodology: "Sums Ondo's fund supplies.",
  ethereum: {
    tvl: sdk.util.sumChainTvls(tvlForAllFunds),
  },
};
