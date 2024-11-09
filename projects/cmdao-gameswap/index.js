const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unknownTokens');
const { pool2 } = require("../helper/pool2");

module.exports = {
    jbc: {
      tvl: sumTokensExport({ 
        owner: '0x280608DD7712a5675041b95d0000B9089903B569',
        tokens: [ADDRESSES.jbc.JUSDT],
      }),
    },
    optimism: {
      pool2: pool2('0x51f97e67b2ff5ed064dc2b27b7a745e0d4c47ee0', ['0xA41F70B283b8f097112ca3Bb63cB2718EE662e49']),
    },
    bitkub: {
      pool2: pool2('0xe5B764566CB5b26fE7568e59370368ACf9c7c5c3', ['0x5Cced24E580586841f326d5088D288e6Ddd201dA']),
    }
};
