const sdk = require("@defillama/sdk");
const { requery } = require("./requery");
const { fetchURL } = require("./utils");
const BigNumber = require("bignumber.js");

const koyoStableSwapVirtualPriceABI = {
  stateMutability: "view",
  type: "function",
  name: "get_virtual_price",
  inputs: [],
  outputs: [
    {
      name: "",
      type: "uint256",
    },
  ],
};

async function sumKoyoLPTokens(
  balances,
  lpTokens,
  owners,
  block,
  chain = "boba"
) {
  const { data: { data: pools } } = await fetchURL(
    `https://api.exchange.koyo.finance/pools/raw/${chain}`
  );
  const lpToSwap = Object.fromEntries(
    Object.entries(pools)
      .filter(([k]) => !["generatedTime"].includes(k))
      .map(([k, pool]) => {
        console.log(k);
        return [pool.addresses.lpToken, pool.addresses.swap].map((addr) =>
          addr.toLowerCase()
        );
      })
  );

  const swapCalls = Object.values(lpToSwap).map((swap) => ({
    target: swap,
  }));
  const virtualPrices = await sdk.api.abi.multiCall({
    block,
    abi: koyoStableSwapVirtualPriceABI,
    calls: swapCalls,
    chain,
  });

  const balanceOfTokens = await sdk.api.abi.multiCall({
    calls: lpTokens
      .map((target) =>
        owners.map((o) => ({
          target,
          params: o,
        }))
      )
      .flat(),
    abi: "erc20:balanceOf",
    block,
    chain,
  });

  await requery(balanceOfTokens, chain, block, "erc20:balanceOf");

  balanceOfTokens.output.forEach((result) => {
    const token = result.input.target.toLowerCase();
    const balance = result.output;

    const virtualPrice = virtualPrices.output.find(
      (call) => call.input.target === lpToSwap[token]
    ).output;

    balances[token] = BigNumber(balance)
      .times(virtualPrice)
      .div(10 ** 18)
      .toFixed(0);
  });
}

module.exports = {
  sumKoyoLPTokens,
};
