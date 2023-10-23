const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, sumTokensExport, } = require('../helper/unwrapLPs');
const { data } = require("../helper/chain/waves");
const sdk = require('@defillama/sdk')

const wavesCoinBridgeContract = '3PFPuctNkdbwGKKUNymWw816jGPexHzGXW5';

async function wavesTVL() {
  const balances = {};
  const contractTVLInWAVES = await data(wavesCoinBridgeContract, "BALANCE");
  sdk.util.sumSingleBalance(balances, 'waves', contractTVLInWAVES.value / 1e8)
  return balances;
}

const config = {
  ethereum: [
    [[nullAddress], '0x882260324AD5A87bF5007904B4A8EF87023c856A'],
    [
      [
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.CRV,
        ADDRESSES.ethereum.UNI,
        ADDRESSES.ethereum.MKR,
        ADDRESSES.ethereum.LINK,
      ],
      '0x0de7b091A21BD439bdB2DfbB63146D9cEa21Ea83'
    ]
  ],
  bsc: [
    [[nullAddress], '0xF1632012f6679Fcf464721433AFAAe9c11ad9e03'],
    [
      [
        ADDRESSES.bsc.USDT,
        ADDRESSES.bsc.USDC,
        ADDRESSES.bsc.BTCB,
      ],
      '0x8DF12786EC0E34e60D4c52f9052ba4e536e9367a'
    ]
  ],
  polygon: [
    [[nullAddress], '0xEa3cc73165748AD1Ca76b4d1bA9ebC43fb399018'],
    [
      [
        ADDRESSES.polygon.USDT,
        ADDRESSES.polygon.USDC,
      ],
      '0xF57dB884606a0ed589c06320d9004FBeD4f81e4A'
    ]
  ],
  tron: [
    [[nullAddress], 'TMsm33cUm8HuxyRqwG7xhV46cmx5NVPPGB'],
    [
      [
        ADDRESSES.tron.USDT,
        ADDRESSES.tron.USDC
      ],
      'TNN42f7dXYksBsh8hjVo8XD8aYSKcSEhJF'
    ]
  ]
}
module.exports = {};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: sumTokensExport({ ownerTokens: config[chain] }) }
})
module.exports.waves = { tvl: wavesTVL }

module.exports.timetravel = false; // Waves blockchain
module.exports.methodology = 'All tokens locked in PepeTeam Bridge.';
