const { tombTvl } = require("../helper/tomb");

const obol = "0x1539C63037D95f84A5981F96e43850d1451b6216";
const smelt = "0x141FaA507855E56396EAdBD25EC82656755CD61e";
const Boardroom = "0x8ff9eFB99D522fAC6a21363b7Ca54d25477637F6";
const SmeltRewardPool = "0x66d1C92f2319C67DA822BAe1Ef33b2C85C391a7b";
const lps = [
    "0x47FcE13359ac80Cc1FC98D46688701B2Bb54300C", // OBOL - FTM LP 
    "0x02E060A4B8453C5dA554d66c2035e3163D453daA", // SMELT - FTM LP
]

module.exports = {
    misrepresentedTokens: true,
    ...tombTvl(obol, smelt, SmeltRewardPool, Boardroom, lps, "ftm", undefined, true, lps[2])
}