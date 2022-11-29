const { masterChefExports } = require("../helper/masterchef");

const SHIR = "0x4ddba615a7F6ee612d3a23C6882B698dFBbef7E7";
const masterchef = "0xD91b2cD0f07A453Bd24F6a798f40f6972e616C9f";

module.exports = {
  ...masterChefExports(masterchef, "bsc", SHIR, false),
};
