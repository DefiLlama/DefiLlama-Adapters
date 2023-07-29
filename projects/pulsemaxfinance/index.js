const { tombTvl } = require("../helper/tomb");

const max = "0x368acF537B1A8EfFE4ceEF11054CBcEAF0302086";
const pshare = "0xbc57572Ba711C8077222142C3374acE7B0c92231";
const rewardpool = "0xEb8A0191Fa31F7aCEDeDe618246f7f7f907139bA";
const boardroom = "0x4c5c8fD88Ba0709949e3C5Be3502500112Cd026c";

const pool2LPs = [
    "0x32D1D76bA3df143C7258d933dAfB048f137c42BA", // PSHARE-DAI
    "0x0edC492E29Ce7bEd4c71f83513E435f5d81cDEF9", // MAX-DAI
    "0x99B45b6f0Dd06866C955207c96431cDA2DA1d34b" // MAX-PSHARE
]

module.exports = {
    misrepresentedTokens: true,
    ...tombTvl(max, pshare, rewardpool, boardroom, pool2LPs, "pulse", undefined, false, pool2LPs[0])
}
