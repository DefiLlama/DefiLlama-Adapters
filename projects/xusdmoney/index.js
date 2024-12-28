const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");

const collateralPoolContracts = [
  // WETH Pool
  "0x7E9320C98389CB43B957Ff2399eA315Bce72fdb4",
  // DAI Pool
  "0x10A06343231Dd722800f2139Edf34a1562549DE3",
  // DAI Pool New
  "0xf13a49Eb6b2F6918500ee5cf8b39bb15a38F5b32",
  // USDC Pool
  "0x75aAf03CBF330e2b3F0623c55B7a528CFCAE8d75",
];

const WETH = ADDRESSES.ethereum.WETH;
const DAI = ADDRESSES.ethereum.DAI;
const USDC = ADDRESSES.ethereum.USDC;
//const XUS = "0x875650dd46b60c592d5a69a6719e4e4187a3ca81";

const stakingContract = "0x6049B0831F8da67f3FE80f5FA07BD300E8f2F22C";
const XUSD = "0x1c9BA9144505aaBa12f4b126Fda9807150b88f80";

const stakingPoolContracts = [
  //XUS/XUSD-LP
  "0x608D8b1511Cb3eB7dbcCb5c626922EBfE7A62583",
  //XUS/ETH-LP
  "0x39d8189306a254120EF88e0A465808BB6532d63B",
  //LINK/XUSD-LP
  "0x5E20B7824f2A7Ba15fda7ECF1a2e6e05219De5aa",
  //DAI/XUSD-LP
  "0x7b24E729aa3a39c0555509A486eA7a415b4Df934",
  //ETH/XUSD-LP
  "0xdaB209915b683EA3cd338D20B07e3Bd63001b87A",
];

const lpPairAddresses = [
  "0x80a23a63bdb304d4784be05df01e7c921d038324",
  "0x8f24e100d785DaAa70e9Ff461A831A0354499F4e",
  "0xc448A8Aacbd29652ce861d2693a883daF8009b26",
  "0x143d8a74CAdf8a3927B2926be0154739f4953422",
  "0x88d9bE8D3DFe82eF3b09641284467f1Ee5E98343",
];

async function ethTvl(api) {
  return api.sumTokens({ owners: collateralPoolContracts, tokens: [WETH, DAI, USDC] });
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: staking(stakingContract, XUSD),
    pool2: pool2s(stakingPoolContracts, lpPairAddresses),
    tvl: ethTvl,
  },
  methodology:
    "Counts liquidty on the Collateral Pools trouggh their Contracts",
};
