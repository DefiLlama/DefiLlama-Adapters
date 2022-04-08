const { masterChefExportsUnknownLP } = require("./helper/masterchef");

const milko = "0x3c786134228b363fb2984619D7560AB56363B2bD";
const masterchef = "0x5d0C5db1D750721Ed3b13a8436c17e035B44c3D0";
const wada = "0xAE83571000aF4499798d1e3b0fA0070EB3A3E3F9";
const whitelist = [
  "0x3c786134228b363fb2984619D7560AB56363B2bD",
  "0xB44a9B6905aF7c801311e8F4E76932ee959c663C", //
  "0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8",
  "0xAE83571000aF4499798d1e3b0fA0070EB3A3E3F9", //
  "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D", //
  "0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C",
  "0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844"
];

module.exports = {
    ...masterChefExportsUnknownLP(masterchef, "milkomeda", milko, wada, whitelist, "cardano")
}; // node test.js projects/milko-farm.js