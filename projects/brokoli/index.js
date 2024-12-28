const { staking } = require("../helper/staking");

/*** Ethereum Addresses ***/
const farmContracts = [
    "0xd723e387D4B8a45d19C25a2e919F510C8B65eFe1",
    "0x8C9e9635861b2C8A9C92D8319AfA2C2c6324b671"
]
const USDC_BRKL_UNIV2 = "0xEBd17511F46A877199Ff08f0eA4f119c9b4Aea50";
const BRKL = "0x4674a4f24c5f63d53f22490fb3a08eaaad739ff8";

/*** BSC Addresses ***/
const farmContracts_bsc = [
    "0x58351236275E6f378BB2211B9fd623fd6E5e9D17",
    "0x9B937aB45Bab1e8CC4590eCF55dC5577caF89dE1"
];
const BUSD_BRKL_CakeLP = "0x0e537bb44eb6064D12326fF2543d918e9b9a5482";

const farmStakingContract_bsc = "0x6A4fab0070f2402F00f12D54250E47BcE36c4F4e"
const BRKL_bsc = "0x66cafcf6c32315623c7ffd3f2ff690aa36ebed38";

module.exports = {
  ethereum: {
    tvl: (async) => ({}),
    pool2: staking(farmContracts, [USDC_BRKL_UNIV2]),   
  },
  bsc: {
    staking: staking(farmStakingContract_bsc, BRKL_bsc),
    pool2: staking(farmContracts_bsc, [BUSD_BRKL_CakeLP]),
  },
  methodology: "Counts liquidty on the staking and pool2 only",
};
