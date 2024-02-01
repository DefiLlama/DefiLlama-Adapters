const { masterChefExports } = require("../helper/masterchef");

const masterchef = "0xD56d886b71b32f0817F4309C8368FE8769d479fc";
const token = "0x4AE1A0D592DC4d1c51D37C2AEfE6D2572FC47F7a";

module.exports = {
    misrepresentedTokens: true,
    ...masterChefExports(masterchef, "bsc", token, false)
}