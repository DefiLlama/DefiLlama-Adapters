const { masterChefExports } = require("../helper/masterchef");

const NIOB = "0x5ac5e6Af46Ef285B3536833E65D245c49b608d9b";
const masterchef = "0xD18B23ad6c8ACc4AD32AAd6a5dF750ce28C8C772";

module.exports = masterChefExports(masterchef, "bsc", NIOB, false);