const { masterChefExports } = require("../helper/masterchef");

const masterchef = "0xdE737bd1Af7D93Dd627D68511A9f69565D6D607b";
const token = "0x1a5A8873DB5b83D9594A381F33CFE2A5543A9Ec6";

module.exports = {
    misrepresentedTokens: true,
    ...masterChefExports(masterchef, "bsc", token, false)
};