const { stakings } = require("../helper/staking");

const stakingContracts = [
  // stakingContract1 =
  "0xA2b37bB22a3E685c5c7ee19DBCc06344FA35d6dc",
  // stakingContract2
  "0x6D905919ab41De27dC566ACD1f04f4F1CA60A160",
  // stakingContract3
  "0x1Da83856f1E2fa6ff07072a4108fd57e13812714",
    // stakingContract4
  "0xfC2c975AC2B14B5F073141A0ba75e1e36d21bBb1",
    // stakingContract5
  "0x27195cb7002A9e121249adc693460F98e69F93eF",
    // stakingContract6
  "0x5f0B3d111DC3e27EcaC483c5d981a27974CB84B4",
    // stakingContract7
  "0xcCACBafF877003853374BDEBca2B0AdAc463DA12",
];

const USDC_BPF_UNIV2 = "0xb2aa61b5bF5Da7b39404A89D20FD9CF10076B77D";
const BPF = "0x5197FBE1a86679FF1360E27862BF88B0c5119BD8";

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: stakings(stakingContracts, BPF),
    pool2: stakings(stakingContracts, [USDC_BPF_UNIV2]),
    tvl: (async) => ({}),
  },
  methodology: "Counts liquidty on the staking and pool2s only",
};
