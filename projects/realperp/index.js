const { staking } = require("../helper/staking");
const { gmxExports } = require("../helper/gmx");

const Vault = "0xEA5C751039e38e1d2C0b8983D4F024e3bc928bc4";
const Staking = "0x10e878aDbCbD35e4356F5272Ae9537814d17A76c";
const RAP = "0x9576ca6D15E7CcCe184fA7523085d21A554B1b52";

module.exports = {
  manta: {
    staking: staking(Staking, RAP),
    tvl: gmxExports({ vault: Vault }),
  },
};
