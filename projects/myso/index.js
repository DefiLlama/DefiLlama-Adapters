const { sumTokens2 } = require("../helper/unwrapLPs");

const pools = [
  "0x9e29ce780ea28ba83053b78473c19544f75c1113", // rETH-ETH pool
  "0x331C54fD17A54dCdDb0215b9f02390cef7c7eE8F", // RPL-USDC pool
  "0x15315dFc9E2Cc4F7F5456323Ab7010a1A74a337d", // RPL-RETH pool
];
async function tvl(_, _b, _cb, { api }) {
  const data = await api.multiCall({
    abi: "function getPoolInfo() view returns (address _loanCcyToken, address _collCcyToken, uint256 _maxLoanPerColl, uint256 _minLoan, uint256 _loanTenor, uint256 _totalLiquidity, uint256 _totalLpShares, uint256 _baseAggrBucketSize, uint256 _loanIdx)",
    calls: pools,
  });
  const toa = pools
    .map((owner, i) => [
      [data[i]._loanCcyToken, owner],
      [data[i]._collCcyToken, owner],
    ])
    .flat();
  return sumTokens2({ api, tokensAndOwners: toa });
}

module.exports = {
  ethereum: { tvl },
  methodology: "token held as collateral + liquidity left to be borrowed",
};
