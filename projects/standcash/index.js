const ADDRESSES = require('../helper/coreAssets.json')
const { stakings } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const boardroomContracts = "0x7F28D5a90b3A0BE2e34accDEF255eC13cf695b1e";
const SAS = "0x4c38d0e726b6c86f64c1b281348e725973542043";
const SAC = "0xaCd8F2523a4613Eee78904354187c81Bb05ae2b8";

const lpStakingContracts = [
  //USDTSASLPTokenSharePool
  "0x05A27c63ADB54faee48DA03D7D10F04DFfF1d5aa",
  //USDTSACLPTokenSharePool
  "0x0F14a4880B7BC3Fc926499Df3AB32c72828eCF0E",
];

const stakingContracts = lpStakingContracts.concat([boardroomContracts]);

const lpAddresses = [
  //SAS_USDT_UNIV2
  "0x841E63A5451e3db6879499d24cae6C6600956839",
  //SAC_USDT_UNIV2
  "0x24A9CeD95BcEBDa453108E9cb1e1D3C21835B29C",
];

const poolContracts = [
  //SACUSDTPool
  "0xf9bb984980E8b503cd9f365101C16E071eC86166",
  //SACUSDCPool
  "0xfDA19204C625dd82B0066a18F218179778C14E56",
  //SACFRAXPool
  "0xeF185DF44a1a8e94B3E8CE2a7D1e88fD5f97DE90",
  //SACESDPool
  "0xeaE9402B0cDd6Ef6a7D8F511F03a655ED6b5f850",
  //SACDAIPool
  "0xBD3316c31c48a3cD9A014a8315d05356c5723CF4",
  //SACBACPool
  "0x4E4c96b68Dd328eE3aaA4B7320Dd86E21D740332",
  //SACAETHPool
  "0x82fb0cff19E2060e912805Fe3496bC878eef17C0",
];

const tokenAddresses = [
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.FRAX,
  //ESD
  "0x36F3FD68E7325a35EB768F1AedaAe9EA0689d723",
  ADDRESSES.ethereum.DAI,
  //BAC
  "0x3449fc1cd036255ba1eb19d65ff4ba2b8903a69a",
  //AETH
  "0xE95A203B1a91a908F9B9CE46459d101078c2c3cb",
];

async function pool2() {
  const balances = {};

  for (let i = 0; i < lpStakingContracts.length; i++) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [[lpAddresses[i], true]],
      [lpStakingContracts[i]]
    );
  }

  for (let i = 0; i < poolContracts.length; i++) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [
        [tokenAddresses[i], false],
        [SAC, false],
      ],
      [poolContracts[i]]
    );
  }

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: stakings(stakingContracts, SAS),
    pool2: pool2,
    tvl: (tvl) => ({}),
  },
  methodology: "Counts liquidty on the Staking and Pool2 Only",
};
