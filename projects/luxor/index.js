const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const treasury = "0xDF2A28Cc2878422354A93fEb05B41Bd57d71DB24"
const LUX = "0x6671e20b83ba463f270c8c75dae57e3cc246cb2b"

module.exports=ohmTvl(
    treasury,
    [
        [ADDRESSES.fantom.DAI, false],
        [ADDRESSES.fantom.WFTM, false],
        ["0x46729c2AeeabE7774a0E710867df80a6E19Ef851", true],
        ["0x951BBB838e49F7081072895947735b0892cCcbCD", true]
    ],
    "fantom",
    "0xf3F0BCFd430085e198466cdCA4Db8C2Af47f0802",
    LUX,
    (addr) => {
        if (addr.toLowerCase() === ADDRESSES.fantom.DAI) {
          return ADDRESSES.ethereum.DAI;
        }
        return `fantom:${addr}`;
    }
)
