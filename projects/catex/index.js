const { sumTokens2 } = require('../helper/unwrapLPs')

// List of Gamma ALM vaults that Catex manages
const CATEX_POOLS = [
'0x236B70D439aE9cD52EBAF9Bfae40AB18549b7fbd',
'0xdf0f120e2ef4B55Ad525F2558144049BfFA3D0b2',
'0xF83d5F96fB4715D4E52359089fA3e4D7C7C32298',
'0x92d24ac95d2a06a225fd746491d54178045c8a77',
'0x265A0f96B61849773a7B515495c6f04B364B28D8',
'0xE227cE7361afA1A4e59baeF6e81dFB48F425Fb03',
'0xF0B332B1991EC3c4Fcd5F027517a8F223Ec0690f',
'0xd773ea2090c11cc3c54BaA530F1ee114A874D610',
'0x29022867Ec10E3d797F3c6826BA2fd98A4a69549',
'0xc887884b38945de0de6e86f119457813305a44b3',
'0x8cf335f06aa29b77dc2f97c75efbcc6062730f3d',
'0x48382bfaee4c68bc0472cc04165033700483b579',
'0x1e18bec019d244bcabc2eeb3e5b55369c80054ac',
'0x3fa8c3d9fdf5ccfee4c42a8bf9b5e87c344c6b4c',
]

module.exports = {
  methodology: 'TVL counts the tokens locked in Gamma ALM vaults that Catex manages on top of Uniswap V4',
  start: 69453847,
  polygon: {
    tvl: async (api) => {
      // Get token addresses for each vault
      const token0s = await api.multiCall({ abi: 'address:token0', calls: CATEX_POOLS })
      const token1s = await api.multiCall({ abi: 'address:token1', calls: CATEX_POOLS })
      
      // Get total amounts including fees for each vault
      const totalAmounts = await api.multiCall({ 
        abi: 'function getTotalAmounts() view returns (uint256 total0, uint256 total1, uint256 totalFee0, uint256 totalFee1)',
        calls: CATEX_POOLS 
      })
      
      // Add balances for each vault
      totalAmounts.forEach((amounts, i) => {
        // Add token0 total (including fees)
        api.add(token0s[i], amounts.total0)
        // Add token1 total (including fees)
        api.add(token1s[i], amounts.total1)
      })
      
      return api.getBalances()
    }
  }
} 