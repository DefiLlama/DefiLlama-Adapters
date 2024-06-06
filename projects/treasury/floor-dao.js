const floorTreasury1 = "0x91E453f442d25523F42063E1695390e325076ca2";
const floorTreasury2 = "0xa9d93a5cca9c98512c8c56547866b1db09090326";

const FLOOR = "0xf59257e961883636290411c11ec5ae622d19455e";
const index = require('../floor-dao/index')
const { ohmTreasury } = require('../helper/treasury')
const { staking } = require('../helper/staking')

module.exports = ohmTreasury(index)
module.exports.ethereum.ownTokens = staking([floorTreasury1, floorTreasury2], FLOOR)
