//  npm i -f
//  node test.js projects/clearpool/index.js

const abi = require("./abi.json");

const { stakings } = require("../helper/staking");
const { getLogs } = require("../helper/cache/getLogs");

const singleStakingContracts = ["0x629E39da1Db5654fe59cAE31d48CAEBB8dC2A9c6"];
const CPOOL = "0x66761fa41377003622aee3c7675fc7b5c1c2fac5";

module.exports = {
  methodology: "We count liquidity by Stables deposited on the pools contracts",
}

const config = {
  ethereum: { factory: '0xde204e5a060ba5d3b63c7a4099712959114c2d48', fromBlock: 14443222 }, // Permissionless Pools
  polygon_zkevm: { factory: '0xCE3Fec90A05992dF1357651FEF6D143FeeC7Ca16', fromBlock: 302970 }, // Permissionless Pools
  polygon: { factory: '0x215CCa938dF02c9814BE2D39A285B941FbdA79bA', fromBlock: 31128013 }, // Permissionless Pools
  optimism: { factory: '0x99C10A7aBd93b2db6d1a2271e69F268a2c356b80', fromBlock: 107128813 }, // Permissionless Pools
  mantle: { factory: '0xB217D93a8f6A4b7861bB2C865a8C22105FbCdE41', fromBlock: 49691965 }, // Permissionless Pools
}

Object.keys(config).forEach(chain => {
  const { fromBlock, factory } = config[chain]

  const tvl = async (api) => {
    const { pools, tokens } = await _getLogs(api)
    return api.sumTokens({ tokensAndOwners2: [tokens, pools] })
  }

  async function _getLogs(api) {
    const logs = await getLogs({
      api,
      target: factory,
      fromBlock,
      eventAbi: 'event PoolCreated(address indexed pool, address indexed owner, address indexed token)',
      onlyArgs: true
    })
    const pools = logs.map(log => log.pool)
    const tokens = logs.map(log => log.token)
    return { pools, tokens }
  }

  const borrowed = async (api) => {
    const { pools, tokens } = await _getLogs(api)
    const bals = await api.multiCall({ abi: abi.borrows, calls: pools })
    api.addTokens(tokens, bals)
  }

  module.exports[chain] = { tvl, borrowed }
})

module.exports.ethereum.staking = stakings(singleStakingContracts, CPOOL)
