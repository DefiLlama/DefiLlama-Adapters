const { ohmTvl } = require("../helper/ohm");

const treasury = "0xDF2A28Cc2878422354A93fEb05B41Bd57d71DB24"
const LUX = "0x6671e20b83ba463f270c8c75dae57e3cc246cb2b"

module.exports=ohmTvl(
    treasury,
    [
        ["0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e", false],
        ["0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", false],
        ["0x46729c2AeeabE7774a0E710867df80a6E19Ef851", true]
    ],
    "fantom",
    "0xf3F0BCFd430085e198466cdCA4Db8C2Af47f0802",
    LUX,
    (addr) => {
        if (addr.toLowerCase() === "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e") {
          return "0x6b175474e89094c44da98b954eedeac495271d0f";
        }
        return `fantom:${addr}`;
    },
    undefined,
    false
)
