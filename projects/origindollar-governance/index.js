const sdk = require("@defillama/sdk");

const staking = "0x0C4576Ca1c365868E162554AF8e385dc3e7C66D9";
const ogv = "0x9c354503C38481a7A7a51629142963F98eCC12D0";

const ethTvl = async (timestamp, ethBlock) => {
  const balances = {};

  const balance_ogv = (
    await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      target: ogv,
      params: [staking],
      block: ethBlock,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, ogv, balance_ogv);

  return balances;
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
};
