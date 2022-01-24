const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const lpReservesAbi = {
  constant: true,
  inputs: [],
  name: "getReserves",
  outputs: [
    { internalType: "uint112", name: "_reserve0", type: "uint112" },
    { internalType: "uint112", name: "_reserve1", type: "uint112" },
    { internalType: "uint32", name: "_blockTimestampLast", type: "uint32" },
  ],
  payable: false,
  stateMutability: "view",
  type: "function",
};
const lpSuppliesAbi = {
  constant: true,
  inputs: [],
  name: "totalSupply",
  outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  payable: false,
  stateMutability: "view",
  type: "function",
};
const token0Abi = {
  constant: true,
  inputs: [],
  name: "token0",
  outputs: [{ internalType: "address", name: "", type: "address" }],
  payable: false,
  stateMutability: "view",
  type: "function",
};
const token1Abi = {
  constant: true,
  inputs: [],
  name: "token1",
  outputs: [{ internalType: "address", name: "", type: "address" }],
  payable: false,
  stateMutability: "view",
  type: "function",
};

/* lpPositions:{
    balance,
    token
}[]
*/
async function unwrapUniswapLPs(
  balances,
  lpPositions,
  block,
  chain = "ethereum",
  transformAddress = (addr) => addr,
  excludeTokensRaw = [],
  retry = false
) {
  const excludeTokens = excludeTokensRaw.map((addr) => addr.toLowerCase());
  const lpTokenCalls = lpPositions.map((lpPosition) => ({
    target: lpPosition.token,
  }));
  const lpReserves = sdk.api.abi.multiCall({
    block,
    abi: lpReservesAbi,
    calls: lpTokenCalls,
    chain,
  });
  const lpSupplies = sdk.api.abi.multiCall({
    block,
    abi: lpSuppliesAbi,
    calls: lpTokenCalls,
    chain,
  });
  const tokens0 = sdk.api.abi.multiCall({
    block,
    abi: token0Abi,
    calls: lpTokenCalls,
    chain,
  });
  const tokens1 = sdk.api.abi.multiCall({
    block,
    abi: token1Abi,
    calls: lpTokenCalls,
    chain,
  });
  if (retry) {
    await Promise.all(
      [
        [lpReserves, lpReservesAbi],
        [lpSupplies, lpSuppliesAbi],
        [tokens0, token0Abi],
        [tokens1, token1Abi],
      ].map(async (call) => {
        await requery(await call[0], chain, block, call[1]);
      })
    );
  }
  await Promise.all(
    lpPositions.map(async (lpPosition) => {
      try {
        const lpToken = lpPosition.token;
        const token0 = (await tokens0).output
          .find((call) => call.input.target === lpToken)
          .output.toLowerCase();
        const token1 = (await tokens1).output
          .find((call) => call.input.target === lpToken)
          .output.toLowerCase();
        const supply = (await lpSupplies).output.find(
          (call) => call.input.target === lpToken
        ).output;
        const { _reserve0, _reserve1 } = (await lpReserves).output.find(
          (call) => call.input.target === lpToken
        ).output;
        if (!excludeTokens.includes(token0)) {
          const token0Balance = BigNumber(lpPosition.balance)
            .times(BigNumber(_reserve0))
            .div(BigNumber(supply));
          sdk.util.sumSingleBalance(
            balances,
            await transformAddress(token0),
            token0Balance.toFixed(0)
          );
        }
        if (!excludeTokens.includes(token1)) {
          const token1Balance = BigNumber(lpPosition.balance)
            .times(BigNumber(_reserve1))
            .div(BigNumber(supply));
          sdk.util.sumSingleBalance(
            balances,
            await transformAddress(token1),
            token1Balance.toFixed(0)
          );
        }
      } catch (e) {
        console.log(
          `Failed to get data for LP token at ${lpPosition.token} on chain ${chain}`
        );
        throw e;
      }
    })
  );
}

const crvPools = {
  // PWRD-3CRV
  "0xbcb91e689114b9cc865ad7871845c95241df4105": {
    swapContract: "0x001C249c09090D79Dc350A286247479F08c7aaD7",
    underlyingTokens: [
      "0xf0a93d4994b3d98fb5e3a2f90dbc2d69073cb86b",
      "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
    ],
  },
};

async function unwrapCrvLPs(
  balances,
  lpPositions,
  block,
  chain = "ethereum",
  transformAddress = (addr) => addr,
  excludeTokens = []
) {
  await Promise.all(
    lpPositions.map(async (lp) => {
      try {
        await unwrapCrv(
          balances,
          lp.token,
          lp.balance,
          block,
          chain,
          transformAddress,
          excludeTokens
        );
      } catch (e) {
        console.log(
          `Failed to get data for LP token at ${lp.token} on chain ${chain}`
        );
        throw e;
      }
    })
  );
}

async function unwrapCrv(
  balances,
  crvToken,
  balance3Crv,
  block,
  chain = "ethereum",
  transformAddress = (addr) => addr,
  excludeTokensRaw = []
) {
  const excludeTokens = excludeTokensRaw.map((t) => t.toLowerCase());
  if (crvPools[crvToken.toLowerCase()] === undefined) {
    return;
  }
  const underlyingTokens = crvPools[crvToken.toLowerCase()].underlyingTokens;
  const crvTotalSupply = sdk.api.erc20.totalSupply({
    target: crvToken,
    block,
    chain,
  });
  const underlyingSwapTokens = (
    await sdk.api.abi.multiCall({
      calls: underlyingTokens.map((token) => ({
        target: token,
        params: [crvToken],
      })),
      block,
      chain,
      abi: "erc20:balanceOf",
    })
  ).output;
  const resolvedCrvTotalSupply = (await crvTotalSupply).output;
  underlyingSwapTokens.forEach((call) => {
    if (excludeTokens.includes(call.input.target.toLowerCase())) {
      return;
    }
    const underlyingBalance = BigNumber(call.output || 0)
      .times(balance3Crv)
      .div(resolvedCrvTotalSupply);
    sdk.util.sumSingleBalance(
      balances,
      transformAddress(call.input.target),
      underlyingBalance.toFixed(0)
    );
  });
}

module.exports = {
  unwrapCrv,
  unwrapCrvLPs,
  unwrapUniswapLPs,
};
