const sdk = require("@defillama/sdk");
const { transformAvaxAddress } = require("../helper/portedTokens");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { pool2 } = require("../helper/pool2");
const { staking } = require("../helper/staking.js");
const abi = require("./abi.json");
const contracts = require("./contracts.json");

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformAvaxAddress();

  const masterChefBalances = (
    await sdk.api.abi.multiCall({
      calls: Object.keys(contracts.markets).map((token) => ({
        target: token,
        params: [contracts.contracts.masterchef],
      })),
      abi: "erc20:balanceOf",
      chain: "avax",
      block: chainBlocks.avax,
    })
  ).output;
  console.log(masterChefBalances);
  const stakingCalls = masterChefBalances.map((b) => ({
    params: [b.output, contracts.markets[b.input.target].underlying],
  }));

  const underlyingBalances = (
    await sdk.api.abi.multiCall({
      calls: stakingCalls,
      target: contracts.contracts.mainStaking,
      abi,
      chain: "avax",
      block: chainBlocks.avax,
    })
  ).output;

  for (let i = 0; i < underlyingBalances.length; i++) {
    const info = Object.values(contracts.markets)[i];
    if (info.isLP) {
      await unwrapUniswapLPs(
        balances,
        [
          {
            balance: masterChefBalances[i].output,
            token: info.isJoeLP
              ? info.underlying
              : Object.keys(contracts.markets)[i],
          },
        ],
        chainBlocks.avax,
        "avax",
        transform
      );
    } else if (info.noUnderlying) {
      sdk.util.sumSingleBalance(
        balances,
        transform(Object.keys(contracts.markets)[i]),
        masterChefBalances[i].output
      );
    } else {
      sdk.util.sumSingleBalance(
        balances,
        transform(underlyingBalances[i].input.params[1]),
        underlyingBalances[i].output
      );
    }
  }
  return balances;
}

module.exports = {
  doublecounted: true,
  avax: {
    tvl,
    staking: staking(
      contracts.contracts.masterchef,
      contracts.contracts.VTX,
      "avax",
      "avax:0x5817D4F0b62A59b17f75207DA1848C2cE75e7AF4"
    ),
    pool2: pool2(
      contracts.contracts.masterchef,
      contracts.contracts.pool2,
      "avax",
      (a) => `avax:${a}`
    ),
  },
};
// node test.js projects/vector/index.js
