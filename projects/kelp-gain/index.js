const rsETH = "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7";
const agETH = "0xe1B4d34E8754600962Cd944B535180Bd758E6c2e";

const tvl = (api) => {
  return api.sumTokens({ owner: agETH, token: rsETH });
};

module.exports = {
  doublecounted: true,
  methodology: "TVL corresponds to the sum of rsETH deposited in the pool",
  ethereum: {
    tvl,
  },
};
