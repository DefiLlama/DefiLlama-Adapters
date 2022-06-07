const abi = require("./abi.json");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");

const SaffronStakingV2Contract = "0x4eB4C5911e931667fE1647428F38401aB1661763";
const SFI = "0xb753428af26e81097e7fd17f40c88aaa3e04902c"

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: staking(SaffronStakingV2Contract, SFI),
    pool2: pool2s([SaffronStakingV2Contract], [
      "0xC76225124F3CaAb07f609b1D147a31de43926cd6",
      "0x23a9292830fc80db7f563edb28d2fe6fb47f8624",
      "0x83887500cf852cb4af33d74c148c9c7c35f91620"
    ]),
    tvl: async()=>({})
  },
  methodology:
    "We count liquidity for Saffon V2 on the Pools (LP) through SaffronStakingV2 Contract",
};
