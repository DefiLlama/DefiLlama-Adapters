const { sumTokensExport } = require('../helper/unknownTokens')

const pall = "0x14feE680690900BA0ccCfC76AD70Fd1b95D10e16"

const staking14days = "0x85e253162C7e97275b703980F6b6fA8c0469D624"
const staking28days = "0x163Ad6AC78FFE40E194310faEaDA8f6615942d7b"
const staking56days = "0x8431060c8e72793aFaDA261E9DD0Ab950e80894F"


module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: () => 0,
    staking: sumTokensExport({ owners: [staking14days, staking28days, staking56days], tokens: [pall] }),
  },
  methodology:
    "Counts all PALL staking in the 3 pools",
};