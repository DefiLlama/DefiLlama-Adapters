// projects/aquabank/index.js
const sdk = require('@defillama/sdk')

const bUSDt = '0x3C594084dC7AB1864AC69DFd01AB77E8f65B83B7'

const BENQI_USDT_RECEIPT = '0xd8fcDa6ec4Bdc547C0827B8804e89aCd817d56EF'
const BENQI_USDC_RECEIPT = '0xB715808a78F6041E46d61Cb123C9B4A27056AE9C'
const BENQI_AUSD_RECEIPT = '0x190D94613A09ad7931FcD17CD6A8F9B6B47ad414'


const EULER_USDT_RECEIPT = '0xa446938b0204Aa4055cdFEd68Ddf0E0d1BAB3E9E'

const VAULTS = [
  '0x7D336B49879a173626E51BFF780686D88b8081ec', // Benqi USDT vault
  '0xb06DE2E9a339d201661045b7D845De3d20373b4F', // Benqi USDC vault
  '0xcCB7De5b7788de551E3b85b50e4834D5B7e3F27c', // Benqi AUSD vault
  '0x61E8f77eD693d3edeCBCc2dd9c55c1d987c47775', // Euler USDT vault
]

const tvl = async (api) => {
    // export raw balances of receipt tokens held by our vaults (priced server-side)
    const tokens = [BENQI_USDT_RECEIPT, EULER_USDT_RECEIPT, BENQI_USDC_RECEIPT, BENQI_AUSD_RECEIPT]
    const owners = VAULTS
    await api.sumTokens({ tokens, owners })
}
  
module.exports = {
    methodology:
        'TVL is calculated from the total supply of bUSDT, bUSDC, and bAUSD, each fully backed 1:1 by stablecoins deposited into Benqi and Euler vaults.',
    avax: { 
        tvl,
    },
}