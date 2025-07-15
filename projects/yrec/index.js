const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// YREC Token Contract Address on Plume Network
const YREC_CONTRACT = '0x9b88F393928c7B5C6434bDDc7f6649a1a0e02FaE'

// YREC Token ABI - only the functions we need for TVL calculation
const YREC_ABI = [
  'function getTotalIPValue() external view returns (uint256)',
  'function getIPValuePerToken() external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)'
]

module.exports = {
  methodology: 'TVL is calculated by reading the total IP value backing all YREC tokens directly from the smart contract. Each YREC token represents exactly $1 USD of intellectual property value.',
  misrepresentedTokens: false,
  plume: {
    tvl: async (_, _b, _c, { api }) => {
      // Read total IP value directly from the YREC contract
      const totalIPValue = await api.call({
        target: YREC_CONTRACT,
        abi: 'function getTotalIPValue() external view returns (uint256)',
      })
      
      // Convert from wei to USD (18 decimals)
      const tvl = totalIPValue / 1e18
      
      return {
        'usd': tvl
      }
    }
  },
  hallmarks: [
    [Math.floor(new Date('2025-07-15')/1000), 'YREC Token Launch'],
  ],
} 