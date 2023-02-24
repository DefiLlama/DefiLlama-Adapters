const { masterChefExports } = require("../helper/masterchef");

const masterchef = "0x0F8E6DD57e86f0Aa9d219AAFAC728004bF96693E";
const token = "0x576BB65B52425d59AC4c702376F88c527f5C7773";

module.exports = {
    misrepresentedTokens: true,
    ...masterChefExports(masterchef, "bsc", token)
}