const { aaveExports } = require("../helper/aave");
const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");

const config = {
  era: "0xB73550bC1393207960A385fC8b34790e5133175E",
  manta: "0x67f93d36792c49a4493652B91ad4bD59f428AD15",
  blast: "0xc6DF4ddDBFaCb866e78Dcc01b813A41C15A08C10",
  linea: "0x67f93d36792c49a4493652B91ad4bD59f428AD15",
  xlayer: "0x97e59722318F1324008484ACA9C343863792cBf6",
  ethereum: "0x47223D4eA966a93b2cC96FFB4D42c22651FADFcf",
};

const linea = {
  treasury: "0x14aAD4668de2115e30A5FeeE42CFa436899CCD8A",
  zeroEthNileLP: "0x0040f36784dda0821e74ba67f86e084d70d67a3a",
  zeroEthNileCLP: "0x179b4B1C19faF18Bed713304c870e9317bc79A84",
  zeroEthLynexCLP: "0xb88261e0DBAAc1564f1c26D78781F303EC7D319B",
  zero: "0x78354f8DcCB269a615A7e0a24f9B0718FDC3C7A7",
  zlpLocker: "0x8bb8b092f3f872a887f377f73719c665dd20ab06",
  zeroLocker: "0x08D5FEA625B1dBf9Bae0b97437303a0374ee02F8",
};

const data = {};
Object.keys(config).forEach((chain) => {
  data[chain] = aaveExports(chain, undefined, undefined, [config[chain]]);
});

data.linea.staking = staking(linea.zeroLocker, linea.zero, "linea");
data.linea.pool2 = pool2s([linea.zlpLocker], [linea.zeroEthNileLP], "linea"); // todo add the lynex and nile LPs from the treasury

module.exports = data;
