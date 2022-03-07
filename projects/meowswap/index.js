const {masterChefExports} = require("../helper/masterchef");

const meow = "0xE8658B07c555E9604329A6a0A82FF6D9c6F68D2F";
const masterchef = "0x4bdd4BdEf3a2e3b707012A31cd993149fE6dE7DF";

module.exports = {
    ...masterChefExports(masterchef, "bsc", meow)
}