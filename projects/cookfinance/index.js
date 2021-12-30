const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking.js");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs.js");
const yieldyakAbi = require("./yieldyakAbi.json");

const cookToken = "0xFF75CEd57419bcaEBe5F05254983b013B0646eF5";
const stakingPool = "0xcAFb07CCB524C957c835Be287f75c6F92db79CA3";

const ethPool2LPs = [
  "0xbdfe29d9e42ea541c581eef6cf3a2bb27b51e2c4", // COOK-ETH
];

const bscPool2LPs = [
  "0x48E29cacd1186A3264E9cfBaAc632c5Cb1F2df60" // COOK-BNB
]

const avaxPool2LPs = [
  "0x3fcd1d5450e63fa6af495a601e6ea1230f01c4e3", // Trader Joe COOK-WAVAX
  "0xf7ff4fb01c3c1ab0128a79953cd8b47526292fb2"  // Pangolin COOK-WAVAX
]

const ethIndexes = [
  "0xA6156492fC79616035F644C71b01e3099819F8EC", // CLI
  "0x43633bDb2675aDaB99CE3059D734b92a1deDAb2b", // EDI
];

const avaIndexes = [
  "0x6F4a6a855412635668d9EBc69977870a637882CE", // YB-MCI
  "0x1967514bEB1464857B54aa3e6cBE4Fc7D245Fa40", // YB-SCI
  "0xd3b4A602DF2a3ABDc0CA241674bCd7566ABA4D93", // AEI
];

async function ethTvl(timestamp, block) {
  let balances = {};

  for (let i = 0; i < ethIndexes.length; i++) {
    let { output: components } = await sdk.api.abi.call({
      target: ethIndexes[i],
      abi: {
        inputs: [],
        name: "getComponents",
        outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
        stateMutability: "view",
        type: "function",
      },
      block,
    });

    for (let j = 0; j < components.length; j++) {
      let { output: balance } = await sdk.api.erc20.balanceOf({
        target: components[j],
        owner: ethIndexes[i],
        block,
      });
      sdk.util.sumSingleBalance(balances, components[j], balance);
    }
  }

  return balances;
}

async function avaTvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.avax;
  let balances = {};
  for (let i = 0; i < avaIndexes.length; i++) {
    let { output: components } = await sdk.api.abi.call({
      target: avaIndexes[i],
      abi: {
        inputs: [],
        name: "getComponents",
        outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
        stateMutability: "view",
        type: "function",
      },
      chain: "avax",
      block,
    });

    for (let j = 0; j < components.length; j++) {
      let { output: balance } = await sdk.api.erc20.balanceOf({
        target: components[j],
        owner: avaIndexes[i],
        chain: "avax",
        block,
      });
      let { output: symbol } = await sdk.api.erc20.symbol(
        components[j],
        "avax"
      );
      if (symbol === "YRT") {
        let { output: underlyingToken } = await sdk.api.abi.call({
          target: components[j],
          block,
          chain: "avax",
          abi: yieldyakAbi.depositToken,
        });
        let { output: underlyingTokenBalance } = await sdk.api.abi.call({
          target: components[j],
          block,
          params: [balance],
          chain: "avax",
          abi: yieldyakAbi.getDepositTokensForShares,
        });
        sdk.util.sumSingleBalance(
          balances,
          "avax:" + underlyingToken,
          underlyingTokenBalance
        );
      } else {
        sdk.util.sumSingleBalance(balances, "avax:" + components[j], balance);
      }
    }
  }
  return balances;
}

async function ethPool2s(timestamp, block) {
  let balances = {};

  let { output: balance } = await sdk.api.abi.multiCall({
    calls: ethPool2LPs.map((address) => ({ target: address })),
    abi: "erc20:totalSupply",
    block,
  });
  for (let i = 0; i < ethPool2LPs.length; i++) {
    await unwrapUniswapLPs(balances, [
      { balance: balance[i].output, token: ethPool2LPs[i] },
    ]);
  }
  return balances;
}

async function bscPool2s(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.bsc;
  let balances = {};

  let { output: balance } = await sdk.api.abi.multiCall({
    calls: bscPool2LPs.map((address) => ({ target: address })),
    abi: "erc20:totalSupply",
    chain: "bsc",
    block,
  });
  for (let i = 0; i < bscPool2LPs.length; i++) {
    await unwrapUniswapLPs(balances, [
      { balance: balance[i].output, token: bscPool2LPs[i] },
    ], block, 'bsc', addr => 'bsc:' + addr);
  }
  return balances;
}

async function avaxPool2s(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.avax;
  let balances = {};

  let { output: balance } = await sdk.api.abi.multiCall({
    calls: avaxPool2LPs.map((address) => ({ target: address })),
    abi: "erc20:totalSupply",
    chain: "avax",
    block,
  });
  for (let i = 0; i < avaxPool2LPs.length; i++) {
    await unwrapUniswapLPs(balances, [
      { balance: balance[i].output, token: avaxPool2LPs[i] },
    ], block, 'avax', addr => 'avax:' + addr);
  }
  return balances;
}

module.exports = {
  methodology:
    "TVL are the tokens locked into the index contracts. Pool2 are the tokens locked into DEX LP. Staking are the tokens locked into the active staking contract.",
  ethereum: {
    tvl: ethTvl,
    pool2: ethPool2s,
    staking: staking(stakingPool, cookToken),
  },
  avalanche: {
    tvl: avaTvl,
    pool2: avaxPool2s,
    staking: staking(
      "0x35bE7982bC5E40A8C9aF39A639bDDcE32081102e",
      "0x637afeff75ca669ff92e4570b14d6399a658902f",
      "avax",
      "avax:0x637afeff75ca669ff92e4570b14d6399a658902f"),
  },
  bsc: {
    pool2: bscPool2s,
    staking: staking(
      "0x1Abeaa9D633162586a4c80389160c33327C9Aff5",
      "0x965b0df5bda0e7a0649324d78f03d5f7f2de086a",
      "bsc",
      "bsc:0x965b0df5bda0e7a0649324d78f03d5f7f2de086a"),
  }
};
