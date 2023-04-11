const sdk = require("@defillama/sdk");

const TOKEN_ADDRESS = "0xF75C7a59bCD9bd207C4Ab1BEB0b32EEd3B6392f3";
const TREASURY_ADDRESS = "0x3D027824a9Eb4cc5E8f24D97FD8495eA9DC7026F";
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

async function tvl(_, _1, _2, { api }) {
  const tokenBalance = await sdk.api.erc20.balanceOf({
    target: TOKEN_ADDRESS,
    owner: TREASURY_ADDRESS
  });

  const wethBalance = await sdk.api.erc20.balanceOf({
    target: WETH_ADDRESS,
    owner: TREASURY_ADDRESS
  });

  return {
    [WETH_ADDRESS]: wethBalance.output,
    [TOKEN_ADDRESS]: tokenBalance.output
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "Gets TVL inside the Kei Treasury.",
  start: 16981691,
  ethereum: {
    tvl
  }
};
