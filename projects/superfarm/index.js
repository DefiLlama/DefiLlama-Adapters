const { staking } = require("../helper/staking");
const { pool2 } = require('../helper/pool2')
const { sumTokensExport } = require("../helper/unwrapLPs")

const superfarm = "0xe53ec727dbdeb9e2d5456c3be40cff031ab40a55";
const superfarmStaking = "0xf35A92585CeEE7251388e14F268D9065F5206207";
const superEthUniLP = "0x25647e01bd0967c1b9599fa3521939871d1d0888";
const inj = "0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30";
const injStaking = "0x8e586D927acE36a3ef7bDDF9f899d2E385d5Fc9b";
const revv = "0x557B933a7C2c45672B610F8954A3deB39a51A8Ca";
const revvStaking = "0xb3EA98747440aDDC6A262735E71B5A5cB29edd80";


module.exports = {
  ethereum: {
    tvl: sumTokensExport({ tokensAndOwners: [[inj, injStaking], [revv, revvStaking]], }),
    staking: staking(superfarmStaking, superfarm),
    pool2: pool2(superfarmStaking, superEthUniLP),
  }
}