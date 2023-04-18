const sdk = require("@defillama/sdk");
const IFIL_TOKEN_CONTRACT = "0x690908f7fa93afC040CFbD9fE1dDd2C2668Aa0e0";

async function tvl(_, _1, _2, { api }) {
  const balances = {};

  const collateralBalance = await api.call({
    abi: "erc20:totalSupply",
    target: IFIL_TOKEN_CONTRACT,
  });

  await sdk.util.sumSingleBalance(
    balances,
    IFIL_TOKEN_CONTRACT,
    collateralBalance,
    api.chain
  );

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "The Infinity Pool is accepting early depositers by minting 1 iFIL token per 1 FIL deposited. This adapter returns the total supply of iFIL tokens, representing the total amount of FIL and WFIL deposited into the early deposit contract.",
  filecoin: {
    tvl,
  },
};
