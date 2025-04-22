const sdk = require('@defillama/sdk')
const { aaveExports } = require("../helper/aave");
const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");

const config = {
  era: ["0xB73550bC1393207960A385fC8b34790e5133175E"],
  manta: ["0x67f93d36792c49a4493652B91ad4bD59f428AD15"],
  blast: ["0xc6DF4ddDBFaCb866e78Dcc01b813A41C15A08C10"],
  hemi: ["0x9698FdF843cbe4531610aC231B0047d9FFc13bC6"],
  base: ["0xA754b2f1535287957933db6e2AEE2b2FE6f38588"],
  linea: [
    "0x67f93d36792c49a4493652B91ad4bD59f428AD15", // main linea market
    '0x9aFB91a3cfB9aBc8Cbc8429aB57b6593FE36E173', // croak linea market
    '0xEe9ec60657B714E3FAC5255a5443AC5EC7Ba5bB0', // foxy linea market
  ],
  xlayer: ["0x97e59722318F1324008484ACA9C343863792cBf6"],
  zircuit: ["0xA754b2f1535287957933db6e2AEE2b2FE6f38588"],
  ethereum: [
    "0x47223D4eA966a93b2cC96FFB4D42c22651FADFcf", // ethereum lrt market
    '0x31063F7CA8ef4089Db0dEdf8D6e35690B468A611', // bitcoin lrt market
    '0x298ECDcb0369Aef75cBbdA3e46a224Cfe622E287' // stablecoin rwa market
  ],
  corn:["0x2f7e54ff5d45f77bFfa11f2aee67bD7621Eb8a93"],
  abstract:["0x8EEAE4dD40EBee7Bb6471c47d4d867539CF53ccF"]
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
  const chainExports = config[chain].map((address) => aaveExports(chain, undefined, undefined, [address]))
  data[chain] = {
    tvl: sdk.util.sumChainTvls(chainExports.map(i => i.tvl)),
    borrowed: sdk.util.sumChainTvls(chainExports.map(i => i.borrowed))
  }
});

data.linea.staking = staking(linea.zeroLocker, linea.zero, "linea");
data.linea.pool2 = pool2s([linea.zlpLocker], [linea.zeroEthNileLP], "linea"); // todo add the lynex and nile LPs from the treasury

module.exports = data;
