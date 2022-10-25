const {masterChefExports} = require('../helper/masterchef');


const masterchef = "0x63cF1a0b96E6db3f61b98f343B1e6F19044ac89a";
const token = "0xAb2453283e85332120100E80EdaE3D24D3dcCAAf";

module.exports = {
    misrepresentedTokens: true,
    ...masterChefExports(masterchef, "cronos", token, false)
}