const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs.js");

const fishToken = "0x3a3Df212b7AA91Aa0402B9035b098891d276572B";
const pawToken = "0xbc5b59ea1b6f8da8258615ee38d40e999ec5d74f";

const masterchef = "0x4ce9Ae2f5983e19AebF5b8Bae4460f2B9EcE811a"; // The MasterChef controls the Polycat Farms and Pools functions for $PAW
const vaultchef = "0xBdA1f897E851c7EF22CD490D2Cf2DAce4645A904"; // The VaultChef controls the Polycat Vault functions.

async function makeCall(target, params, abi, chainBlocks, chain) {
  let { output: result } = await sdk.api.abi.call({
    target,
    params,
    abi,
    chainBlocks,
    chain,
  });
  return result;
}

async function makeMultiCall(calls, abi, chainBlocks, chain) {
  let { output: result } = await sdk.api.abi.multiCall({
    calls,
    abi,
    chainBlocks,
    chain,
  });

  return result;
}

async function polygonTvl(timestmap, block, chainBlocks) {
  let balances = {};
  let masterchefPoolLength = await makeCall(
    masterchef,
    null,
    abi["poolLength"],
    chainBlocks["polygon"],
    "polygon"
  );
  let vaultchefPoolLength = await makeCall(
    vaultchef,
    null,
    abi["poolLength"],
    chainBlocks["polygon"],
    "polygon"
  );
  let masterchefCalls = [];
  let vaultchefCalls = [];

  for (let i = 0; i < masterchefPoolLength; i++) {
    masterchefCalls.push({
      target: masterchef,
      params: i.toString(),
    });
  }

  for (let i = 0; i < vaultchefPoolLength; i++) {
    vaultchefCalls.push({
      target: vaultchef,
      params: i.toString(),
    });
  }

  let masterchefpoolInfo = await makeMultiCall(
    masterchefCalls,
    abi["farmPoolInfo"],
    chainBlocks["polygon"],
    "polygon"
  );
  let vaultchefPoolInfo = await makeMultiCall(
    vaultchefCalls,
    abi["vaultPoolInfo"],
    chainBlocks["polygon"],
    "polygon"
  );

  for (let i = 0; i < masterchefpoolInfo.length; i++) {
    let token = masterchefpoolInfo[i].output.lpToken;
    let balance = masterchefpoolInfo[i].output.totalDeposited;
    await unwrapUniswapLPs(
      balances,
      [{ balance, token }],
      chainBlocks["polygon"],
      "polygon",
      (addr) => `polygon:${addr}`,
      [fishToken, pawToken]
    );
  }

  for (let i = 0; i < vaultchefPoolInfo.length; i++) {
    let token = vaultchefPoolInfo[i].output.want;
    if (token === fishToken || token === pawToken) {
      continue;
    }
    let balance = await makeCall(
      token,
      vaultchef,
      abi["balanceOf"],
      chainBlocks["polygon"],
      "polygon"
    );
    let name = await makeCall(
      token,
      null,
      abi["name"],
      chainBlocks["polygon"],
      "polygon"
    );

    switch (name) {
      case "Uniswap V2":
      case "SushiSwap LP Token":
      case "Dfyn LP Token":
      case "WaultSwap LP":
      case "ApeSwapFinance LPs":
      case "FireBird Liquidity Provider":
      case "Jetswap LPs":
        await unwrapUniswapLPs(
          balances,
          [{ balance, token }],
          chainBlocks["polygon"],
          "polygon",
          (addr) => `polygon:${addr}`,
          [fishToken, pawToken]
        );
        break;

      default:
        sdk.util.sumSingleBalance(balances, `polygon:${token}`, balance);
        break;
    }
  }

  return balances;
}

const pool2Pairs = [
  "0x6b2d7c0cc9f75db8dd5228f329730bbc732fea05", //WMATIC-FISH
  "0xbff681c59158ea5cf7d29e439cb701a9bb8b79f8", //USDC-FISH
  "0xd3485dcbcb74d6f971a798228a65f9a3487ebc13" //WMATIC-PAW
];

async function pool2Tvl(timestamp, block, chainBlocks) {
  let balances = {};

  for (let i = 0; i < pool2Pairs.length; i++) {
    let token0 = await makeCall(
      pool2Pairs[i],
      null,
      abi["token0"],
      chainBlocks["polygon"],
      "polygon"
    );
    let token1 = await makeCall(
      pool2Pairs[i],
      null,
      abi["token1"],
      chainBlocks["polygon"],
      "polygon"
    );
    let reserves = await makeCall(
      pool2Pairs[i],
      null,
      abi["getReserves"],
      chainBlocks["polygon"],
      "polygon"
    );
    sdk.util.sumSingleBalance(
      balances,
      `polygon:${token0}`,
      reserves._reserve0
    );
    sdk.util.sumSingleBalance(
      balances,
      `polygon:${token1}`,
      reserves._reserve1
    );
  }

  return balances;
}

module.exports = {
  polgon: {
    tvl: polygonTvl,
    pool2: pool2Tvl
  }
};
