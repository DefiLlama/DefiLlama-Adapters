const { masterChefExports } = require("../helper/masterchef");

const masterchef = "0x24e5C28c060ae0836e6378FfDa3d0846fee0c56E";
const token = "0xbbdaA8700A7caAAf3b4aAc1fA6Fb5fF76Fc14C56";

module.exports = masterChefExports(masterchef, "bsc", token)