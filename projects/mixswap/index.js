const { masterChefExports, } = require("../helper/masterchef")

const token = "0xb8b9e96e9576af04480ff26ee77d964b1996216e";
const masterchef = "0x775eead1076b149d5eb81065fcd18a3a5717085a";

module.exports = {
    ...masterChefExports(masterchef, "bsc", token, false,)
}