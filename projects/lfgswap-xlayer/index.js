const { getUniTVL } = require('../helper/unknownTokens');
const { stakings } = require("../helper/staking");

const { stakings } = require("../helper/staking");

const stakingContracts = [
  "0xbb715427B0f50e5b5463839488a4858A9713a604"
];


const lfgToken = "0xf7a0b80681ec935d6dd9f3af9826e68b99897d6d";

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x0F6DcC7a1B4665b93f1c639527336540B2076449',
    })
  }
}