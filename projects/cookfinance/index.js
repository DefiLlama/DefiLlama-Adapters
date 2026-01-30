const { staking } = require("../helper/staking.js");
const { pool2, } = require("../helper/pool2");
const { sumTokens2 } = require('../helper/unwrapLPs')

const stakingContractHeco = "0xF0979F9692966D110E39d82a44655c9934F5cC73";
const COOK_heco = "0x74189862b069e2be5f7c8e6ff08ea8e1b1948519";

const stakingPool2ContractHeco = "0x275FC87A40222977E4E28Fd846e8CB9d80Add258";
const ETH_COOK_HMDXLP = "0x9275637737b56004312E50be0eaB20b7A20eAF3a";

const cookToken = "0xFF75CEd57419bcaEBe5F05254983b013B0646eF5";
const stakingPool = "0xcAFb07CCB524C957c835Be287f75c6F92db79CA3";

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

const getComponentsABI = "address[]:getComponents"
const getCKsABI = "address[]:getCKs"

async function getTvl({ api, indices }) {
  const components = await api.multiCall({    abi: getComponentsABI,    calls: indices,  })
  const ownerTokens = indices.map((v, i) => [components[i], v])
  return sumTokens2({ ownerTokens, api,  })

}

async function ethTvl(api) {
  return getTvl({ indices: ethIndexes, api })
}

async function avaTvl(api) {
  const CONTROLLER_ADDRESS = "0xE565711e7a59800e110c959E156121988E6F4704";
  let avaIndexes = await api.call({    target: CONTROLLER_ADDRESS,    abi: getCKsABI,  });
  return getTvl({ indices: avaIndexes, api })
}

async function bscTvl(api) {
  const CONTROLLER_ADDRESS = "0x822aeB433A4Ea7A97b76287cB513C3985034a2Bd";
  let bscIndexes = await api.call({    target: CONTROLLER_ADDRESS,    abi: getCKsABI,  });
  return getTvl({ indices: bscIndexes, api })
}

module.exports = {
  methodology:
    "TVL are the tokens locked into the index contracts. Pool2 are the tokens locked into DEX LP. Staking are the tokens locked into the active staking contract.",
  ethereum: {
    tvl: ethTvl,
    pool2: staking(
      ["0x4b21da40dd8d9f4363e69a9a1620d7cdb49123be"],
      ethPool2LPs,
    ),
    staking: staking(stakingPool, cookToken),
  },
  avax: {
    tvl: avaTvl,
    pool2: staking(["0x35be7982bc5e40a8c9af39a639bddce32081102e", "0x188bED1968b795d5c9022F6a0bb5931Ac4c18F00"], avaxPool2LPs),
    staking: staking(
      "0x35bE7982bC5E40A8C9aF39A639bDDcE32081102e",
      "0x637afeff75ca669ff92e4570b14d6399a658902f",
    ),
  },
  bsc: {
    pool2: staking(
      ["0x47b517061841e6bFaaeB6336C939724F47e5E263"],
      bscPool2LPs,
    ),
    staking: staking(
      "0x1Abeaa9D633162586a4c80389160c33327C9Aff5",
      "0x965b0df5bda0e7a0649324d78f03d5f7f2de086a",
    ),
    tvl: bscTvl,
  },
  heco: {
    staking: staking(stakingContractHeco, COOK_heco),
    pool2: pool2(stakingPool2ContractHeco, ETH_COOK_HMDXLP),
  },
};
