const { masterChefExports } = require("../helper/masterchef");

const frog = "0xFA5c941BC491Ee6Dc1E933f38d01d8B5D5637205";
const masterchef = "0x254D43bD428DA1420Ee043cD30bDA455f353c241";

module.exports = {
    ...masterChefExports(masterchef, "fantom", frog)
}