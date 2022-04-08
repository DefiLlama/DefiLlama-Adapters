const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking.js");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs.js");
const yieldyakAbi = require("./yieldyakAbi.json");

const cookToken = "0xFF75CEd57419bcaEBe5F05254983b013B0646eF5";
const stakingPool = "0xcAFb07CCB524C957c835Be287f75c6F92db79CA3";

const ethPool2LPs = [
  "0xbdfe29d9e42ea541c581eef6cf3a2bb27b51e2c4", // COOK-ETH
  "0xe3437c8232cffd64aec48a9d87db3f9ae1cb7558", // CLI-ETH
];

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

module.exports = {
  methodology:
    "TVL are the tokens locked into the index contracts. Pool2 are the tokens locked into the UNI LP pools. Staking are the tokens locked into the active staking contract.",
  ethereum: {
    tvl: ethTvl,
    pool2: ethPool2s,
    staking: staking(stakingPool, cookToken),
  },
  avalanche: {
    tvl: avaTvl,
  },
};
