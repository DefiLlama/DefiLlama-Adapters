const { uniV3Export } = require('../helper/uniswapV3')
const { getConnection, sumTokens2, decodeAccount } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

const factory = '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865'
const programId = 'HpNfyc2Saw7RKkQd8nEL4khUcuPhQ7WwY1B2qjx8jxFq'

const solTvl = async () => {
  const connection = getConnection()
  const accounts = await connection.getProgramAccounts(new PublicKey(programId), { filters: [ { dataSize: 1544 } ] })
  
  const tokenAccounts = []
  for (const account of accounts) {
    const poolData = decodeAccount('pancakeswapV3Pool', account.account)
    
    if (poolData.vaultA && poolData.vaultB) {
      tokenAccounts.push(poolData.vaultA.toString())
      tokenAccounts.push(poolData.vaultB.toString())
    }
  }

  return await sumTokens2({ tokenAccounts })
}

module.exports = {
  solana: { tvl: solTvl },
  ...uniV3Export({
    bsc: {
      factory, fromBlock: 26956207, blacklistedTokens: [
        '0x860368babf32129c18306a70ce7db10c5b437072',
        '0xc476d3961f77645464acccce404eb17815a80878',
        '0xf8c7f403829cc0f9a37f126a3da41358c232acdf',
        '0x95e7c70b58790a1cbd377bc403cd7e9be7e0afb1',
        '0x454f4597582df557c2757403f47d3f3bbb890d43',
        '0xf1917602fff55a5ebccc7d03aead225dd9bf3776',
        '0x121a3fba8456ebce13964363ba35fea00c2aa3d2',
        '0xd24616870ca41bc01074446988faeb0085a71190',
        '0xb4357054c3dA8D46eD642383F03139aC7f090343', // PORT3 - hack
      ]
    },
    ethereum: { factory, fromBlock: 16950685, },
    polygon_zkevm: { factory, fromBlock: 750148, },
    linea: { factory, fromBlock: 1445, },
    era: { factory: '0x1BB72E0CbbEA93c08f535fc7856E0338D7F7a8aB', fromBlock: 9413438, },
    arbitrum: { factory, fromBlock: 101028949, blacklistedTokens: ['0x12d773bb0c679d4dfbaf700086dc5e399656f892', '0x1a6b3a62391eccaaa992ade44cd4afe6bec8cff1']},
    base: { factory, fromBlock: 2912007, },
    op_bnb: { factory, fromBlock: 1721753, },
    monad: { factory, fromBlock: 23058782, },
  })
}
