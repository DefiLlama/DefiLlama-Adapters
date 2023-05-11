const { masterChefExports } = require("../helper/masterchef");

const masterchef = "0xb1e61bc864511b1da011f0f7b179fab9f12dbbee";
const token = "0xF00e46f3eEd43232c882c16796eE1D6793a33675";

module.exports = {
    misrepresentedTokens: true,
    ...masterChefExports(masterchef, "bsc", token, false)
}