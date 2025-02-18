const { sumTokens2 } = require('../helper/unwrapLPs');

const TOKEN_ADDRESS = "0xD38B305CaC06990c0887032A02C03D6839f770A8";
const PS_LIQUIDITY_POOL_ADDRESS = "0xcabCf51b5ca7F4Cf7133eA98a49C91C4b6225A38";

async function tvl(_, _b, _cb, { api }) {
  return sumTokens2({
    api,
    tokens: [TOKEN_ADDRESS],
    owners: [PS_LIQUIDITY_POOL_ADDRESS],
  });
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "TVL is calculated by checking the liquidity pool reserves on PancakeSwap.",
  bsc: { tvl },
};
