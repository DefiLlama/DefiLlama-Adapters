const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs.js");

const token = "0x4C392822D4bE8494B798cEA17B43d48B2308109C"; // POLLY Token
const masterFarmer = "0x850161bF73944a8359Bd995976a34Bb9fe30d398"; // POLLY MasterFarmer

//Excludes pools where which one token in pool does not have CoinGecko listing for polygon
const excludedPools = [
  "0xce5B8977f5021f1EF1232B1D4a0CFd03E8BCBa9B", // CVX-ETH
  "0x5e5C517Ec55d6393d91d6A1379e5Ae393A01a423", // ALPHA-ETH
  "0x6be10c5C7178af8C49997D07d6A5444C15e58170", // UMA-ETH
  "0xbf61E1D82bD440cb9da11d325c046f029a663890", // MKR-ETH
  "0x14dBE3e6814FD532EF87E4bE9b4192C018752823", // ALCX-ETH
  "0x2481cBe674FB72cF8CD3031Ff4747078d168c9b3", // BAO-ETH
];

//Converts token address to token that CoinGecko will recognize
const translateToken = {
  "0x4257EA7637c355F81616050CbB6a9b709fd72683":
    "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b", // CVX
  "0x3AE490db48d74B1bC626400135d4616377D0109f":
    "0xa1faa113cbe53436df28ff0aee54275c13b40975", // ALPHA
  "0x3066818837c5e6eD6601bd5a91B0762877A6B731":
    "0x04fa0d235c4abf4bcf4787af4cf447de572ef828", // UMA
  "0xc81278a52AD0e1485B7C3cDF79079220Ddd68b7D":
    "0x374cb8c27130e2c9e04f44303f3c8351b9de61c1", // BAO
  "0x6f7C932e7684666C9fd1d44527765433e01fF61d":
    "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2", // MKR
  "0x95c300e7740D2A88a44124B424bFC1cB2F9c3b89":
    "0xdbdb4d16eda451d0503b854cf79d55697f90c8df", // ALCX
};

const pool2LPs = [
  "0xf27c14aedad4c1cfa7207f826c64ade3d5c741c3", // POLLY-ETH
  "0x095fc71521668d5bcc0fc3e3a9848e8911af21d9", // POLLY-nDEFI
  "0xf70b37a372befe8c274a84375c233a787d0d4dfa", // POLLY-RAI
  "0xD0Fa2eaA5d854F184394e93f7b75624084600685", // nDEFI-RAI
  "0x1534d7c91bd77eb447ACb7fB92eA042B918f58bb", // nDEFI-ETH
  "0x095fC71521668D5bcC0FC3e3a9848e8911aF21d9", // POLLY-nDEFI
];

const nDefi = "0xd3f07EA86DDf7BAebEfd49731D7Bbd207FedC53B"; // nDEFI Nest
const nStable = "0x2Bb2eF50c53E406c80875663C2A2e5592F8a3ccc"

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  let lpPositions = [];

  let { output: poolLength } = await sdk.api.abi.call({
    target: masterFarmer,
    abi: abi["poolLength"],
    block: chainBlocks.polygon,
    chain: "polygon",
  });

  let { output: pools } = await sdk.api.abi.multiCall({
    calls: Array.from({ length: Number(poolLength) }, (_, i) => ({
      target: masterFarmer,
      params: Number(i),
    })),
    abi: abi["poolInfo"],
    block: chainBlocks.polygon,
    chain: "polygon",
  });

  for (let i = 0; i < pools.length; i++) {
    let token = pools[i].output.lpToken;

    if (token === nDefi || token === nStable || excludedPools.includes(token)) {
      continue;
    }

    let { output: balance } = await sdk.api.abi.call({
      target: token,
      params: masterFarmer,
      abi: abi["balanceOf"],
      block: chainBlocks.polygon,
      chain: "polygon",
    });
    lpPositions.push({
      balance,
      token,
    });
  }

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks.polygon,
    "polygon",
    (addr) => `polygon:${addr}`,
    [token, nDefi]
  );

  for (let i = 0; i < excludedPools.length; i++) {
    let { output: balance } = await sdk.api.abi.call({
      target: excludedPools[i],
      params: masterFarmer,
      abi: abi["balanceOf"],
      block: chainBlocks.polygon,
      chain: "polygon",
    });

    let { output: totalSupply } = await sdk.api.abi.call({
      target: excludedPools[i],
      abi: abi["totalSupply"],
      block: chainBlocks.polygon,
      chain: "polygon",
    });

    let { output: token0 } = await sdk.api.abi.call({
      target: excludedPools[i],
      abi: abi["token0"],
      block: chainBlocks.polygon,
      chain: "polygon",
    });

    let { output: token1 } = await sdk.api.abi.call({
      target: excludedPools[i],
      abi: abi["token1"],
      block: chainBlocks.polygon,
      chain: "polygon",
    });

    let { output: reserves } = await sdk.api.abi.call({
      target: excludedPools[i],
      abi: abi["getReserves"],
      block: chainBlocks.polygon,
      chain: "polygon",
    });

    let tokens = [token0, token1];
    let reserveBalance = [reserves._reserve0, reserves._reserve1];

    for (let j = 0; j < tokens.length; j++) {
      if (tokens[j] in translateToken) {
        sdk.util.sumSingleBalance(
          balances,
          translateToken[tokens[j]],
          Number(reserveBalance[j] * (balance / totalSupply))
        );
      } else {
        sdk.util.sumSingleBalance(
          balances,
          `polygon:${tokens[j]}`,
          Number(reserveBalance[j] * (balance / totalSupply))
        );
      }
    }
  }

  // Supply of nDEFI reflects the collateral locked into the contract
  let { output: totalSupply } = await sdk.api.erc20.totalSupply({
    target: nDefi,
    block: chainBlocks.polygon,
    chain: "polygon",
  });
  sdk.util.sumSingleBalance(balances, `polygon:${nDefi}`, totalSupply);

  return balances;
}

async function pool2(timestamp, block, chainBlocks) {
  let balances = {};
  let lpPositions = [];
  for (let i = 0; i < pool2LPs.length; i++) {
    let token = pool2LPs[i];
    let { output: balance } = await sdk.api.abi.call({
      target: token,
      params: masterFarmer,
      abi: abi["balanceOf"],
      block: chainBlocks.polygon,
      chain: "polygon",
    });
    lpPositions.push({
      balance,
      token,
    });
  }

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks.polygon,
    "polygon",
    (addr) => `polygon:${addr}`
  );

  return balances;
}

async function staking(timestamp, block, chainBlocks) {
  let balances = {};

  let { output: balance } = await sdk.api.erc20.balanceOf({
    target: nDefi,
    owner: masterFarmer,
    block: chainBlocks.polygon,
    chain: "polygon",
  });

  await sdk.util.sumSingleBalance(balances, `polygon:${nDefi}`, balance);

  return balances;
}

module.exports = {
  polygon: {
    tvl,
    pool2,
    staking,
  },
};
