const BigNumber = require("bignumber.js");
const v2TVL = require("./v2");
const { ETH, WETH, DEFI_SWAP_LAUNCH_DATE } = require("./constant");

async function tvl(timestamp, block) {
  const [v2] = await Promise.all([v2TVL(timestamp, block)]);
  // replace WETH with ETH for v2
  v2[ETH] = v2[WETH];
  delete v2[WETH];

  const tokenAddresses = new Set(Object.keys(v2));

  const balances = Array.from(tokenAddresses).reduce(
    (accumulator, tokenAddress) => {
      const v2Balance = new BigNumber(v2[tokenAddress] || "0");
      accumulator[tokenAddress] = v2Balance.toFixed();

      return accumulator;
    },
    {}
  );

  return balances;
}

module.exports = {
  name: "DeFi Swap",
  token: "CRO",
  category: "dexes",
  start: DEFI_SWAP_LAUNCH_DATE,
  tvl,
};
