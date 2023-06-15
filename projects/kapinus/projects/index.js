const {getUniTVL} = require("../helper/unknownTokens");
const { stakings } = require("../helper/staking");

const factory = "0x70e881fa43a7124e36639b54162395451cef1922";


const stakingPools = [
  // kARS pool
  "0xc17ad4c7c08fe5049a33dc403f321e51e19bc19b",

  // kBRL pool
  "0x0d9bdea6ebc8cd41bf6e110abc5f6a157cb9f708",
]

module.exports = {
  bsc: {
    staking: stakings(stakingPools, 'bsc'),
    tvl: getUniTVL({ chain: 'bsc', factory, })
  }
};
