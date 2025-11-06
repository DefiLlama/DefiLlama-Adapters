// projects/aquabank/index.js
const sdk = require('@defillama/sdk')

const bUSDt = '0x3C594084dC7AB1864AC69DFd01AB77E8f65B83B7'

const BENQI_RECEIPT = '0xd8fcDa6ec4Bdc547C0827B8804e89aCd817d56EF'
const EULER_RECEIPT = '0xa446938b0204Aa4055cdFEd68Ddf0E0d1BAB3E9E'

const VAULTS = [
  '0x7D336B49879a173626E51BFF780686D88b8081ec', // Benqi vault
  '0x61E8f77eD693d3edeCBCc2dd9c55c1d987c47775', // Euler vault
]

const tvl = async (api) => {
    // export raw balances of receipt tokens held by our vaults (priced server-side)
    const tokens = [BENQI_RECEIPT, EULER_RECEIPT]
    const owners = VAULTS
    await api.sumTokens({ tokens, owners })
}
  
module.exports = {
    methodology:
        'TVL is calculated based on the total supply of bUSDT, which is fully backed by USDt deposited into Benqi and Euler vaults. Each bUSDT represents 1 USDt of collateralized liquidity.',
    avax: { 
        tvl,
    },
}