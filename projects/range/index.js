const { getLogs } = require('../helper/cache/getLogs')

const ABI = require('./abi.json');
const config ={
  ethereum: [
    { factory: '0xf1e70677fb1f49471604c012e8B42BA11226336b', fromBlock: 17266660 }, // uniswap
    { factory: '0x3edeA0E6E94F75F86c62E1170a66f4e3bD7d77fE', fromBlock: 18460401 }, // pancakeswap
    { factory: '0xDE07a0D5C9CA371E41a869451141AcE84BCAd119', fromBlock: 18375548, factoryType: 'GHO' }, // GHO
    { factory: '0x06D38cFA75FE0E9C41B0C58F102bCb2Df2577732', fromBlock: 10000835 } // uniswap
  ],
  arbitrum: [
    { factory: '0xB9084c75D361D1d4cfC7663ef31591DeAB1086d6', fromBlock: 88503603 }, // uniswap
    { factory: '0x42f2dBb72964ac2854bF1C781E525C5CE1e19d52', fromBlock: 136696158 }, // sushiswap
    { factory: '0x2274AC83290eB9355f851b447D3046b32A5B4f52', fromBlock: 138961230 }, // camelot
    { factory: '0xCCA961F89a03997F834eB5a0104efd9ba1f5800E', fromBlock: 153518527 }, // pancakeswap
  ],
  bsc: [
    { factory: '0xad2b34a2245b5a7378964BC820e8F34D14adF312', fromBlock: 28026886 }, // pancakeswap
  ],
  polygon: [
    { factory: '0xad2b34a2245b5a7378964BC820e8F34D14adF312', fromBlock: 42446548 }, // quickswap
    {factory: '0x9eD6C646b4A57e48DFE7AE04FBA4c857AD71d162', fromBlock: 	45889702} // retro
  ],
  base: [
    { factory: '0x4bF9CDcCE12924B559928623a5d23598ca19367B', fromBlock: 2733457 }, // uniswap
  ],
  mantle: [
    { factory: '0x3E89E72026DA6093DD6E4FED767f1f5db2fc0Fb4', fromBlock: 5345161 }, // agni
    { factory: '0xCCA961F89a03997F834eB5a0104efd9ba1f5800E', fromBlock: 14374189, factoryType: 'izumi' }, // izumi
    { factory: '0xD22D1271d108Cd09C38b8E5Be8536E0E366DCd23', fromBlock: 14063599 }, // fusionX
    { factory: '0xbf3CC27B036C01A4482d07De191F18F1d8e7B00c', fromBlock: 18309127 } // swapsicle
  ],
  manta: [
    { factory: '0x52B29C6154Ad0f5C02416B8cB1cEB76E082fC9C7', fromBlock: 899433, factoryType: 'izumi' } // izumi
  ],
  zeta: [
    { factory: '0x52B29C6154Ad0f5C02416B8cB1cEB76E082fC9C7', fromBlock: 1562427, factoryType: 'izumi' } // izumi
  ],
  scroll: [
    { factory: '0x52B29C6154Ad0f5C02416B8cB1cEB76E082fC9C7', fromBlock: 1803841, factoryType: 'izumi' } // izumi
  ],
  zkfair: [
    { factory: '0x873fD467A2A7e4E0A71aD3c45966A84797e55B5B', fromBlock: 6740958, factoryType: 'izumi' } // izumi
  ],
  blast: [
    { factory: '0x6b12399172036db8a8E2b7e2206175080C981A4D', fromBlock: 228630 } // Thruster
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
    tvl: async (api) => {
      const factories = config[chain];
      const allLogs = [];
      for (const { factory, fromBlock, factoryType } of factories) {
        const logs = await getLogs({
          api,
          target: factory,
          topic: 'VaultCreated(address,address)',
          eventAbi: 'event VaultCreated(address indexed uniPool, address indexed vault)',
          onlyArgs: true,
          fromBlock,
        })
        logs.forEach((log) => allLogs.push({ factory, log, chain, factoryType }));
      }
      const getVault = i => i.log.vault
      const ignoreVault = vault => !ignoreList[chain] || !ignoreList[chain].includes(vault)
      let vaults = allLogs.filter(({ factoryType }) => !factoryType      ).map(getVault);
      
      vaults = vaults.filter(ignoreVault); // Remove excluded vaults

      // Collect Izumi Vaults Separately
      let izumiVaults = allLogs.filter(({ factoryType}) => factoryType === 'izumi').map(getVault); 
      izumiVaults = izumiVaults.filter(ignoreVault);

      // Collect GHO Vaults Separately
      let ghoVaults = allLogs.filter(({ factoryType}) => factoryType === 'GHO').map(getVault);
      ghoVaults = ghoVaults.filter(ignoreVault);

      // ===== Non Izumi & Non GHO vaults only =====
      let token0s = await api.multiCall({ abi: "address:token0", calls: vaults })
      let token1s = await api.multiCall({ abi: "address:token1", calls: vaults })
      // ===== Izumi vaults only =====
      token0s.push(...(await api.multiCall({ abi: "address:tokenX", calls: izumiVaults })))
      token1s.push(...(await api.multiCall({ abi: "address:tokenY", calls: izumiVaults })))

      const bals = await api.multiCall({ abi: ABI.underlyingBalance, calls: [...vaults, ...izumiVaults] })
      
      // All non-GHO vaults
      bals.forEach(({ amount0Current, amount1Current }, i) => {
        api.add(token0s[i], amount0Current)
        api.add(token1s[i], amount1Current)
      })

      // ===== GHO Vaults Only =====
      let ghoToken1s = await api.multiCall({ abi: "address:collateralToken", calls: ghoVaults })
      const ghoBals = await api.multiCall({ abi: ABI.getBalanceInCollateralToken, calls: ghoVaults })
      ghoBals.forEach((amount, i) => {
        api.add(ghoToken1s[i], amount);
      })
      return api.getBalances()
    }
  }
})