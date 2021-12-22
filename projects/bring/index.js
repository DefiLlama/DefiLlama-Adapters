const { staking, stakings } = require("../helper/staking");
const { transformBscAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { pool2s } = require("../helper/pool2");

/*** Ethereum Addresses ***/
const chefContracts = "0xDfa3D27Aa7E93527b2075Da5b7911184449f2c27";
const BRNG = "0x3Ecb96039340630c8B82E5A7732bc88b2aeadE82";

const listOfToken = [
  //APYS
  "0xf7413489c474ca4399eee604716c72879eea3615",
  //1MIL
  "0xa4ef4b0b23c1fc81d3f9ecf93510e64f58a4a016",
  //HAPI
  "0xd9c2d319cd7e6177336b0a9c93c21cb48d84fb54",
  //NUX
  "0x89bd2e7e388fab44ae88bef4e1ad12b4f1e0911c",
];

/*** New BSC Addresses ***/
const chefContractsNew_bsc = "0xe9d8b35e1D51b9C17504E5903C3F4D5b14d8c29E";
const BRNG_bsc = "0x939D5A13cf0074586a2Dcf17bC692B2D3CCdD517";
const BNB_BRNG2_CakeLP = "0xE412f518A6a39351c965E201A329eC83047FEb4A";

const lpPoolsNew_bsc = [
  // WBNB-WELD 6
  "0x91bf1ad3868a45bf710c516a7869dcf3e61b8b7b",
  // WBNB-YARL 9
  "0x2dC3A32895D13732a151A17C0f40E695C73AD797",
  // WBNB-SMG 2
  "0x21b64d891805b0c6437e8209146e60ad87ebb499",
];

const listOfTokenNew_bsc = [
  //YARL
  "0x843CbC1732aE7D7ba0533C6380989DACec315FfE",
  //SMG
  "0x6bfd576220e8444ca4cc5f89efbd7f02a4c94c16",
  //WELD
  "0x5b6ebb33eea2d12eefd4a9b2aeaf733231169684",
];

/*** Old BSC Addresses ***/
const chefContractsOld_bsc = "0xbb6e99F9565d872F7D75850c43D9CA5c46c6fF0c";

const lpPoolsOld_bsc = [
  // WBNB-APYS
  "0x510b29a93ebf098f3fc24a16541aaa0114d07056",
  // WBNB-ROAD
  "0x9e0eaf240eebed129136f4f733480feabbca136b",
  // WBNB-HGET
  "0xf74ee1e10e097dc326a2ad004f9cc95cb71088d3",
];

const listOfTokenOld_bsc = [
  //APYS
  "0x37dfacfaeda801437ff648a1559d73f4c40aacb7",
  //ROAD
  "0x1a3057027032a1af433f6f596cab15271e4d8196",
  //HGET
  "0xc7d8d35eba58a0935ff2d5a33df105dd9f071731",
];

async function calc(
  balances,
  chefContract,
  lpTokens,
  chain = "ethereum",
  bool = false
) {
  let chainBlocks = {};
  const transformAddress = await transformBscAddress();
  for (const token of lpTokens) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [[token, bool]],
      [chefContract],
      chainBlocks[chain],
      chain,
      chain == "bsc" ? transformAddress : (id) => id
    );
  }
}

async function bscTvl() {
  const balances = {};

  await calc(balances, chefContractsNew_bsc, lpPoolsNew_bsc, "bsc", true);
  await calc(balances, chefContractsNew_bsc, listOfTokenNew_bsc, "bsc");

  await calc(balances, chefContractsOld_bsc, lpPoolsOld_bsc, "bsc", true);
  await calc(balances, chefContractsOld_bsc, listOfTokenOld_bsc, "bsc");

  return balances;
}

async function ethTvl() {
  const balances = {};

  await calc(balances, chefContracts, listOfToken);

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: staking(chefContracts, BRNG),
    tvl: ethTvl,
  },
  bsc: {
    staking: stakings(
      [chefContractsNew_bsc, chefContractsOld_bsc],
      BRNG_bsc,
      "bsc"
    ),
    pool2: pool2s(
      [chefContractsNew_bsc, chefContractsOld_bsc],
      [BNB_BRNG2_CakeLP],
      "bsc"
    ),
    tvl: bscTvl,
  },
  methodology: "Counts liquidty of the Pools through their chefContracts",
};
