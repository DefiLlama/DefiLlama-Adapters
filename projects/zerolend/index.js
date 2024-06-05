const { aaveExports } = require("../helper/aave");

const config = {
  era: "0xB73550bC1393207960A385fC8b34790e5133175E",
  manta: "0x67f93d36792c49a4493652B91ad4bD59f428AD15",
  blast: "0xc6DF4ddDBFaCb866e78Dcc01b813A41C15A08C10",
  linea: "0x67f93d36792c49a4493652B91ad4bD59f428AD15",
  xlayer: "0x97e59722318F1324008484ACA9C343863792cBf6",
  ethereum: "0x47223D4eA966a93b2cC96FFB4D42c22651FADFcf",
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = aaveExports(chain, undefined, undefined, [
    config[chain],
  ]);
});
