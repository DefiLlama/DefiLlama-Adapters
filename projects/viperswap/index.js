const { calculateUniTvl } = require("../helper/calculateUniTvl");
const { fixHarmonyBalances } = require("../helper/portedTokens");
const { staking } = require("../helper/staking");

const factory = "0x7d02c116b98d0965ba7b642ace0183ad8b8d2196";
const viper = "0xea589e93ff18b1a1f1e9bac7ef3e86ab62addc79";
const xviper = "0xe064a68994e9380250cfee3e8c0e2ac5c0924548";

async function tvl(timestamp, block, chainBlocks) {
  let balances = await calculateUniTvl(addr => {
    return `harmony:${addr}`;
  }, chainBlocks.harmony, "harmony", factory, 0, true);
  fixHarmonyBalances(balances);
  return balances;
}

module.exports = {
  harmony: {
    tvl,
    staking: staking(xviper, viper, "harmony")
  }
}