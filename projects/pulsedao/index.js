const { tombTvl } = require("../helper/tomb");

const pld = "0x6A5E24E62135e391B6dd77A80D38Ee5A40834167";
const pshare = "0xB92E1FdA97e94B474516E9D8A9E31736f542e462";
const boardroom = "0x88a0EC0c1664cd1205D0a7870302FE184b9a24fA";
const rewardPool = "0xBD7f881bC9b35ff38bd5A99eA0A34d559aF950A4";
const lps = [
    "0xd19d1056807f65fd2e10b8993d869204e1f07155",
    "0x96723306274c3fffee1375b322d361d0085bc768"
]

module.exports = {
    hallmarks: [
        [1647216000, "Rug Pull"]
    ],
    deadFrom: 1648765747,
    misrepresentedTokens: true,
    ...tombTvl(pld, pshare, rewardPool, boardroom, lps, "fantom", undefined, false, lps[1])
} 
