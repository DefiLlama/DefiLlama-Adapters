const { uniTvlExport } = require('../helper/calculateUniTvl.js');
const { staking } = require("../helper/staking.js");

const TWX = '0x41171d5770c4c68686d1af042ada88a45b02f82b'
const MASTER_CHEF = '0x22A5C7376C76D2D7ddC88D314912217B20d6eEc0'
const FACTORY_BSC = "0x4E66Fda7820c53C1a2F601F84918C375205Eac3E";

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: uniTvlExport(FACTORY_BSC),
    staking: staking(MASTER_CHEF, TWX)
  },
  methodology: "TVL comes from the DEX liquidity pools, staking TVL is accounted as the TWX on 0x41171D5770C4c68686d1aF042Ada88a45B02f82b",
}