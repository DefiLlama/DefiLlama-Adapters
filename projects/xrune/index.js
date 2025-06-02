const { staking } = require("../helper/staking.js");


const token = "0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c";
const ethStaking = [
  "0x93f5dc8bc383bb5381a67a67516a163d1e56012a", //Staking
  "0x2a092e401507dD4877cCd0b4Ee70B769452DbB7a", //2-Month Vault
  "0xc20434f595c32B5297A737Cb173382Dd2485C2cC", //4-Month Vault
  "0x8ba0C510Da4507D1F5f73ff9E1FcD14Edc819EB2", //6-Month Vault
];

module.exports = {
  methodology: `TVL comes from the Staking Vaults and Launchpad Tiers`,
  ethereum: {
    tvl: () => ({}),
    staking: staking([...ethStaking, '0x817ba0ecafD58460bC215316a7831220BFF11C80'], token),
  },
};
