const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

/*
 * Using the ETH POOL2 LPs as I did is INCORRECT.
 * It is calculating the total LPs bridged to Polygon, not the total staked on Polygon.
 * I wasn't sure how to unwrap the LPs that are staked on Polygon.
 */

// ETH POOL2 LPS
const ethPool2LPs = [
  {
    owner: "0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf",
    pool: "0x916560C92f423BF7d20f34591a6B27a254c3bD7A",
  },
]; // ETH-YUP LP

// POLYGON POOL2 LPS
const polyPool2LPs = [
  {
    owner: "0xabc4250b8813D40c8C42290384C3C8c8BA33dBE6",
    pool: "0xfe8bacb45a5ce5cf0746f33d3a792c98fbd358e0",
  }, // POLY-YUP LP
];

async function pool2(balances, chainBlocks, chain, pool) {
  let lpPositions = [];
  let lpBalances = (
    await sdk.api.abi.multiCall({
      calls: pool.map((p) => ({
        target: p.pool,
        params: p.owner,
      })),
      abi: "erc20:balanceOf",
      block: chainBlocks[chain],
      chain: chain,
    })
  ).output;
  lpBalances.forEach((i) => {
    lpPositions.push({
      balance: i.output,
      token: i.input.target,
    });
  });
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks[chain],
    chain,
    (addr) => `${chain}:${addr}`
  );
  return balances;
}

async function polygonPool2(timestamp, block, chainBlocks) {
  let balances = {};
  await pool2(balances, chainBlocks["polygon"], "polygon", polyPool2LPs);
  await pool2(balances, block, "ethereum", ethPool2LPs);
  return balances;
}

module.exports = {
  polygon: {
    tvl: async () => ({}),
    pool2: polygonPool2,
  },
};
