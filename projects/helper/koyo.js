const sdk = require("@defillama/sdk");
const { requery } = require("./requery");
const { fetchURL } = require("./utils");
const BigNumber = require("bignumber.js");
const { usdtAddress, toUSDT } = require("./balances");

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

/**
 * @description This function presumes that passed LP Tokens are from USD based stable pools.
 * @param {Object.<string, number>} balances
 * @param {string[]} lpTokens
 * @param {string[]} owners
 * @param {number[]} block
 * @param {string} [chain="boba"]
 * @param {*} transformAddress
 */
async function sumKoyoLPTokens(
  balances,
  lpTokens,
  owners,
  block,
  chain = "boba",
  transformAddress = (addr) => addr
) {
  const {
    data: { data: pools },
  } = await fetchURL(`https://api.exchange.koyo.finance/pools/raw/${chain}`);
  const lpToSwap = Object.fromEntries(
    Object.entries(pools)
      .filter(([k]) => !["generatedTime"].includes(k))
      .map(([, pool]) =>
        [pool.addresses.lpToken, pool.addresses.swap].map((addr) =>
          addr.toLowerCase()
        )
      )
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

    const virtualizedBalance = BigNumber(balance).times(
      BigNumber(virtualPrice).div(10 ** 18)
    );

    sdk.util.sumSingleBalance(
      balances,
      usdtAddress,
      toUSDT(virtualizedBalance.div(10 ** 18))
    );
  });
}

module.exports = {
  sumKoyoLPTokens,
};
