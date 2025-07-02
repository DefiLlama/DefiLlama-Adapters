const { staking } = require("../helper/staking");

const base_vault = "0xe1515D3A8c503a0fc68015844a9fc742D1c80927";
const base_staking = "0x3D893CC2C70242907cAac245D04C565056174EF7";
const base_GMS = "0x13dE6E0290C19893949650fe6fdf9CDfFAFa6040";

module.exports = {
  doublecounted: true,
  methodology: 'staked gms + vault balance',
  base: {
    staking: staking(base_staking, base_GMS),
    tvl: staking(base_vault, '0x2D5875ab0eFB999c1f49C798acb9eFbd1cfBF63c'),
  },
};