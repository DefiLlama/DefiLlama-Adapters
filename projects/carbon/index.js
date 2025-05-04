const { staking } = require("../helper/staking");
const { pool2 } = require('../helper/pool2')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');

const stakingETHContract = "0x27F0408729dCC6A4672e1062f5003D2a07E4E10D";

const stakingCARBONContract = "0x2C5058325373d02Dfd6c08E48d91FcAf8fD49f45";
const CARBON = "0xfa42da1bd08341537a44a4ca9d236d1c00a98b40";

const stakingPool2Contracts = [
  //stakingCARBON_WETHContract
  "0x701e594B58b183b93C1ebaE437fBC9a9A3eC97d7",
  //stakingCARBON_NYANContract
  "0x45acd6Af27B2506ad68C0fEA9F597D6eE6818722",
];
const lpAddresses = [
  //CARBON_WETH_SLP
  "0x08da83452Ae158c3F348d4e0789b7A78989f34eE",
  //CRABON_NYAN_SLP
  "0x89450F6C7d7f2c5971E9Ee28e94d8b199d17f673",
];

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    staking: staking(stakingCARBONContract, CARBON),
    pool2: pool2(stakingPool2Contracts, lpAddresses),
    tvl: sumTokensExport({tokensAndOwners: [[nullAddress, stakingETHContract]]}),
  },
  methodology:
    "Counts as TVL the ETH asset deposited through StakingETH Contract, and we count Staking and Pool2 parts in the same way",
};
