const sdk = require("@defillama/sdk");
const { getConfig } = require('../helper/cache')

const BigNumber = require("bignumber.js");
const { usdtAddress, toUSDT } = require("./balances");

const koyoStableSwapVirtualPriceABI = "uint256:get_virtual_price"

async function sumKoyoLPTokens(
  balances,
  lpTokens,
  owners,
  block,
  chain = "boba",
) {
  const {
     data: pools
  } = await getConfig('koyo/'+chain, `https://api.exchange.koyo.finance/pools/raw/${chain}`);
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
