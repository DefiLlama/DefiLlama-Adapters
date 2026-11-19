const { sumTokens2 } = require("../helper/unwrapLPs");

// api.myso.finance (pool list) is gone; these are the ethereum pools it last returned
const pools = [
  "0x15315dFc9E2Cc4F7F5456323Ab7010a1A74a337d",
  "0x9E29CE780eA28Ba83053b78473c19544F75c1113",
  "0xb339953fC028B9998775C00594a74Dd1488eE2c6",
  "0x331C54fD17A54dCdDb0215b9f02390cef7c7eE8F",
  "0xEA9134ad24795549580C7c542134a670D0D19433",
];

async function tvl(api) {
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
  arbitrum: { tvl: () => ({ }) },
  methodology: "token held as collateral + liquidity left to be borrowed",
};
