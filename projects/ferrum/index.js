const { stakings } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const stakingContracts = [
  //Staking v1.0
  "0x71f3e1a61c14d6f4b6d2a72a13fc6fe13d8a86a9",
  "0x16BBCf93a0f4bB27a15eE8937B58928D6158eBe9",
  "0x41ea5097f3ea49c00ccfb35e74763d29766daddf",
  //Staking v2.0
  "0x45972d73d35a315c0d8357846303209991b84ccb",
  "0xeee410b42bc3a71271f191579858cf7e3cbb2e70",
  "0xbD5c104AD40EF137D6810E6CCC0b2b7185410374",
  "0x143D7eE3Fab601264248C2C3F45bE430451e353f",
  //Staking v3.0
  "0x4eccea6360a4fc63ab4b37d4895bcc64e40cd9c4",
  "0xa9ac39abc7fcfac10321ceba05050f099afb8042",
  "0x840f8f2978521cafa659f390532de235633a15ec",
  "0x1f4bccd90c65135e17287058b667c0a004f443cd",
  //Staking v3.1
  "0x08cd09c8e42edffefc56c7fe33c547701fccb5c9",
  "0x34fc4e1b8456ea8340902f3d7168c536db5b977d",
  //Staking iron mountain
  "0x96add70053eac0534899c4c51e818add70d96f7a",
  "0x3844a75a2d81f7da0af24ef996b17ce0a18de361",
  "0x2a300082aafe41509e3465447c6a3ac08556e5d7",
];

const FRM = "0xE5CAeF4Af8780E59Df925470b050Fb23C43CA68C";

const stakingPoolContract = "0x11E075725d061DeB6981b19C4ea30983B4E2e070";
const FRM_DFYN_LP = "0x0C77b6682b6fFfFe9599B41E39eBa1c1bCf923D8";

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: stakings(stakingContracts, FRM),
    tvl: (async) => ({}),
  },
  polygon: {
    pool2: pool2(stakingPoolContract, FRM_DFYN_LP),
  },
  methodology: "Counts liquidty on the staking and pool2 only",
};
