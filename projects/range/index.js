const { getLogs } = require('../helper/cache/getLogs')

const ABI = require('./abi.json');
const config ={
  ethereum: [
    { factory: '0xf1e70677fb1f49471604c012e8B42BA11226336b', fromBlock: 17266660 }, // uniswap
  ],
  arbitrum: [
    { factory: '0xB9084c75D361D1d4cfC7663ef31591DeAB1086d6', fromBlock: 88503603 }, // uniswap
    { factory: '0x42f2dBb72964ac2854bF1C781E525C5CE1e19d52', fromBlock: 136696158 }, // sushiswap
    { factory: '0x2274AC83290eB9355f851b447D3046b32A5B4f52', fromBlock: 138961230 }, // camelot
  ],
  bsc: [
    { factory: '0xad2b34a2245b5a7378964BC820e8F34D14adF312', fromBlock: 28026886 }, // pancakeswap
  ],
  polygon: [
    { factory: '0xad2b34a2245b5a7378964BC820e8F34D14adF312', fromBlock: 42446548 }, // quickswap
  ],
  base: [
    { factory: '0x4bF9CDcCE12924B559928623a5d23598ca19367B', fromBlock: 2733457 }, // uniswap
  ],
  mantle: [
    { factory: '0x3E89E72026DA6093DD6E4FED767f1f5db2fc0Fb4', fromBlock: 5345161 }, // agni
    { factory: '0xCCA961F89a03997F834eB5a0104efd9ba1f5800E', fromBlock: 14374189 }, // izumi
    { factory: '0xD22D1271d108Cd09C38b8E5Be8536E0E366DCd23', fromBlock: 14063599 }, // fusionX
  ]
}


module.exports = {
  methodology: 'assets deployed on DEX as LP + asset balance of vaults',
  doublecounted: true,
  start: 1683965157,
};

// vaults that were deployed through factory but are uninitialized and unused
const ignoreList  = {mantle : ["0x3f7a9ea2403F27Ce54624CE505D01B2204eDa030"]}
Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const factories = config[chain];
      const allLogs = [];
      for (const { factory, fromBlock } of factories) {
        const logs = await getLogs({
          api,
          target: factory,
          topic: 'VaultCreated(address,address)',
          eventAbi: 'event VaultCreated(address indexed uniPool, address indexed vault)',
          onlyArgs: true,
          fromBlock,
        })
        allLogs.push(...logs);
      }
      let vaults = allLogs.map(log => log.vault);
      vaults = vaults.filter(vault => !ignoreList[chain] || !ignoreList[chain].includes(vault));

      const isIzumiFactory = factories.some(({ factory }) => factory === '0xCCA961F89a03997F834eB5a0104efd9ba1f5800E');
      let token0Abi, token1Abi;
      if(isIzumiFactory) {
        token0Abi = "address:tokenX"
        token1Abi = "address:tokenY"
      } else {
        token0Abi = "address:token0"
        token1Abi = "address:token1"
      }
      const token0s = await api.multiCall({ abi: token0Abi, calls: vaults })
      const token1s = await api.multiCall({ abi: token1Abi, calls: vaults })
      const bals = await api.multiCall({ abi: ABI.underlyingBalance, calls: vaults })
      bals.forEach(({ amount0Current, amount1Current }, i) => {
        api.add(token0s[i], amount0Current)
        api.add(token1s[i], amount1Current)
      })
    }
  }
})
