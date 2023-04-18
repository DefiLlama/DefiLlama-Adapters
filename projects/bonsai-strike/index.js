const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../helper/unwrapLPs");

const bnbCallVault = '0x01cEF5B79044E1CCd9b6Ad76c3d0985b5A33F769';
const bnb = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

async function tvl(_, _1, _2, { api }) {
  const balances = {};

  const totalBalance = await api.call({
    abi: "uint256:totalBalance",
    target: bnbCallVault,
  });

  await sdk.util.sumSingleBalance(balances, bnb, totalBalance, api.chain)

  return balances;
}

module.exports = {
  bsc: {
    tvl,
  }
}; 