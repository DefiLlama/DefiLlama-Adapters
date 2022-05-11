const { tombTvl } = require("../helper/tomb");

const token = "0x2B7c5841997275d2D548cE9b19D54B655725EBFc";
const share = "0x7B510C49d1894d5E9C980e356eB82dD7995e6EdF";
const rewardPool = "0xfe0cC03e061c87f3aCC97736c11FC32Cc87f7bC6";
const masonry = "0x54A9E4bA5d9CE9eA8BC92c6b12FD9BE39a8eb272";

const pool2LPs = [
    "0x7cb0158531efded51ca662564f14b4d28cdde6eb",
    "0x8d36bb2f98fd508bd1b239b07b9b9d05d7d91267"
];

module.exports = {
    deadFrom: 1648765747,
    misrepresentedTokens: true,
    ...tombTvl(token, share, rewardPool, masonry, pool2LPs, "fantom", undefined, false, "0x7CB0158531efdeD51CA662564F14b4d28CDDe6eB")
}
