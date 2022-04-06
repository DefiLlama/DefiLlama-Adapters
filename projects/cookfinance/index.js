const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking.js");
const { pool2, pool2s } = require("../helper/pool2");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs.js");
const yieldyakAbi = require("./yieldyakAbi.json");
const alpacaFinanceAbi = require("../alpaca-finance/abi.json");
const venusFinanceAbi = require("./venusFinanceAbi.json");
const BigNumber = require("bignumber.js");

const stakingContractHeco = "0xF0979F9692966D110E39d82a44655c9934F5cC73";
const COOK_heco = "0x74189862b069e2be5f7c8e6ff08ea8e1b1948519";

const stakingPool2ContractHeco = "0x275FC87A40222977E4E28Fd846e8CB9d80Add258";
const ETH_COOK_HMDXLP = "0x9275637737b56004312E50be0eaB20b7A20eAF3a";

const cookToken = "0xFF75CEd57419bcaEBe5F05254983b013B0646eF5";
const stakingPool = "0xcAFb07CCB524C957c835Be287f75c6F92db79CA3";

const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const wBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const ethPool2LPs = [
  "0xbdfe29d9e42ea541c581eef6cf3a2bb27b51e2c4", // COOK-ETH
];

const bscPool2LPs = [
  "0x48E29cacd1186A3264E9cfBaAc632c5Cb1F2df60", // COOK-BNB
];

const avaxPool2LPs = [
  "0x3fcd1d5450e63fa6af495a601e6ea1230f01c4e3", // Trader Joe COOK-WAVAX
  "0xf7ff4fb01c3c1ab0128a79953cd8b47526292fb2", // Pangolin COOK-WAVAX
];

const ethIndexes = [
  "0xA6156492fC79616035F644C71b01e3099819F8EC", // CLI
  "0x43633bDb2675aDaB99CE3059D734b92a1deDAb2b", // EDI
];

const alpacaComponents = new Set([
  "0xbfF4a34A4644a113E8200D7F1D79b3555f723AfE",
  "0x08FC9Ba2cAc74742177e0afC3dC8Aed6961c24e7",
  "0x7C9e73d4C71dae564d41F78d56439bB4ba87592f",
  "0x158Da805682BdC8ee32d52833aD41E74bb951E59",
  "0x800933D685E7Dc753758cEb77C8bd34aBF1E26d7",
  "0xd7D069493685A581d27824Fc46EdA46B7EfC0063"
]);

const venusComponents = new Set([
  "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
  "0xA07c5b74C9B40447a954e1466938b865b6BBea36"
]);

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
  const CONTROLLER_ADDRESS = "0xE565711e7a59800e110c959E156121988E6F4704";
  let balances = {};
  let { output: avaIndexes } = await sdk.api.abi.call({
    target: CONTROLLER_ADDRESS,
    abi: {
      inputs: [],
      name: "getCKs",
      outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
      stateMutability: "view",
      type: "function",
    },
    chain: "avax",
    block,
  });
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
        if (underlyingToken === '0x0000000000000000000000000000000000000000') {
          // set underlyingToken to WAVAX whenever yieldYakVault.depositToken returns zero_address
          underlyingToken = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'
        }
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

async function alpacaUnderlyingTokenAndBalance(component, componentBalance, block) {
  let { output: underlyingToken } = await sdk.api.abi.call({
    target: component,
    block,
    chain: "bsc",
    abi: alpacaFinanceAbi.token,
  });
  let {output: underlyingTokenTotalSupply} = await sdk.api.abi.call({
    target: component,
    block,
    chain: "bsc",
    abi: alpacaFinanceAbi.totalToken,
  });
  let {output: ibTokenTotalSupply} = await sdk.api.abi.call({
    target: component,
    block,
    chain: "bsc",
    abi: alpacaFinanceAbi.totalSupply,
  });
  componentBalance = new BigNumber(componentBalance);
  underlyingTokenTotalSupply = new BigNumber(underlyingTokenTotalSupply);
  ibTokenTotalSupply = new BigNumber(ibTokenTotalSupply);
  const underlyingTokenBalance = componentBalance.times(underlyingTokenTotalSupply).idiv(ibTokenTotalSupply).toNumber();
  return {
    'underlyingToken': underlyingToken,
    'underlyingTokenBalance': underlyingTokenBalance
  }
}

async function venusUnderlyingTokenAndBalance(component, componentBalance, block) {
  let underlyingToken;
  if (component === vBNB) {
    // set underlyingToken to WAVAX whenever yieldYakVault.depositToken returns zero_address
    underlyingToken = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
  } else {
    let { output: underlyingTokenData } = await sdk.api.abi.call({
      target: component,
      block,
      chain: "bsc",
      abi: venusFinanceAbi.underlying,
    });
    underlyingToken = underlyingTokenData;
  }

  let {output: exchangeRateStored} = await sdk.api.abi.call({
    target: component,
    block,
    chain: "bsc",
    abi: venusFinanceAbi.exchangeRateStored,
  });
  componentBalance = new BigNumber(componentBalance);
  exchangeRateStored = new BigNumber(exchangeRateStored);
  const underlyingTokenBalance = componentBalance.times(exchangeRateStored).idiv(new BigNumber('1e+18')).toNumber();
  return {
    'underlyingToken': underlyingToken,
    'underlyingTokenBalance': underlyingTokenBalance
  }
}

async function bscTvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.bsc;
  const CONTROLLER_ADDRESS = "0x822aeB433A4Ea7A97b76287cB513C3985034a2Bd";
  let balances = {};
  let { output: bscIndexes } = await sdk.api.abi.call({
    target: CONTROLLER_ADDRESS,
    abi: {
      inputs: [],
      name: "getCKs",
      outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
      stateMutability: "view",
      type: "function",
    },
    chain: "bsc",
    block,
  });
  for (let i = 0; i < bscIndexes.length; i++) {
    let { output: components } = await sdk.api.abi.call({
      target: bscIndexes[i],
      abi: {
        inputs: [],
        name: "getComponents",
        outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
        stateMutability: "view",
        type: "function",
      },
      chain: "bsc",
      block,
    });
    for (let j = 0; j < components.length; j++) {
      let { output: componentBalance } = await sdk.api.erc20.balanceOf({
        target: components[j],
        owner: bscIndexes[i],
        chain: "bsc",
        block,
      });
      if (alpacaComponents.has(components[j])) {
        const res = await alpacaUnderlyingTokenAndBalance(components[j], componentBalance, block)
        sdk.util.sumSingleBalance(
          balances,
          "bsc:" + res.underlyingToken,
          res.underlyingTokenBalance
        );
      } else if (venusComponents.has(components[j])) {
        const res = await venusUnderlyingTokenAndBalance(components[j], componentBalance, block)
        sdk.util.sumSingleBalance(
          balances,
          "bsc:" + res.underlyingToken,
          res.underlyingTokenBalance
        );
      } else {
        sdk.util.sumSingleBalance(balances, "bsc:" + components[j], componentBalance);
      }
    }
  }
  return balances;
}

module.exports = {
  methodology:
    "TVL are the tokens locked into the index contracts. Pool2 are the tokens locked into DEX LP. Staking are the tokens locked into the active staking contract.",
  ethereum: {
    tvl: ethTvl,
    pool2: pool2s(
      ["0x4b21da40dd8d9f4363e69a9a1620d7cdb49123be"],
      ethPool2LPs,
      "ethereum"
    ),
    staking: staking(stakingPool, cookToken),
  },
  avalanche: {
    tvl: avaTvl,
    pool2: pool2s(["0x35be7982bc5e40a8c9af39a639bddce32081102e", "0x188bED1968b795d5c9022F6a0bb5931Ac4c18F00"], avaxPool2LPs, "avax"),
    staking: staking(
      "0x35bE7982bC5E40A8C9aF39A639bDDcE32081102e",
      "0x637afeff75ca669ff92e4570b14d6399a658902f",
      "avax",
      //"avax:0x637afeff75ca669ff92e4570b14d6399a658902f"
    ),
  },
  bsc: {
    pool2: pool2s(
      ["0x47b517061841e6bFaaeB6336C939724F47e5E263"],
      bscPool2LPs,
      "bsc"
    ),
    staking: staking(
      "0x1Abeaa9D633162586a4c80389160c33327C9Aff5",
      "0x965b0df5bda0e7a0649324d78f03d5f7f2de086a",
      "bsc"
    ),
    tvl: bscTvl,
  },
  heco: {
    staking: staking(stakingContractHeco, COOK_heco, "heco"),
    pool2: pool2(stakingPool2ContractHeco, ETH_COOK_HMDXLP, "heco"),
  },
};
