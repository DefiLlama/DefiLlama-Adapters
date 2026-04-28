const { getConnection, sumTokens2, getAssociatedTokenAddress } = require('../helper/solana')
const { sumTokens2: evmSumTokens } = require('../helper/unwrapLPs')
const { PublicKey } = require('@solana/web3.js')

const SOLANA_PROGRAM = 'JoeaRXgtME3jAoz5WuFXGEndfv4NPH9nBxsLq44hk9J'
const AVAX_FACTORY = '0x501ee2D4AA611C906F785e10cC868e145183FCE4'

// Token Mill Solana market account layout (368 bytes):
//   offset  0 -  7: Anchor discriminator
//   offset  8 - 39: config account (factory-owned)
//   offset 40 - 71: creator pubkey
//   offset 72 -103: base token mint
//   offset 104-135: quote token mint
// Each market PDA owns two ATAs: ATA(market, base_mint) and ATA(market, quote_mint)
async function solanaTvl(api) {
  const connection = getConnection()
  const programId = new PublicKey(SOLANA_PROGRAM)

  const markets = await connection.getProgramAccounts(programId, {
    filters: [{ dataSize: 368 }],
  })

  const tokenAccounts = []
  for (const { pubkey, account } of markets) {
    const data = account.data
    const baseMint = new PublicKey(data.slice(72, 104))
    const quoteMint = new PublicKey(data.slice(104, 136))
    tokenAccounts.push(getAssociatedTokenAddress(baseMint, pubkey).toString())
    tokenAccounts.push(getAssociatedTokenAddress(quoteMint, pubkey).toString())
  }

  return sumTokens2({ tokenAccounts, api, allowError: true })
}

async function avalancheTvl(api) {
  const markets = await api.fetchList({
    target: AVAX_FACTORY,
    itemAbi: 'function getMarketAt(uint256) view returns (address)',
    lengthAbi: 'function getMarketsLength() view returns (uint256)',
  })

  const [baseTokens, quoteTokens] = await Promise.all([
    api.multiCall({ abi: 'function getBaseToken() view returns (address)', calls: markets }),
    api.multiCall({ abi: 'function getQuoteToken() view returns (address)', calls: markets }),
  ])

  const tokensAndOwners = []
  markets.forEach((market, i) => {
    tokensAndOwners.push([baseTokens[i], market])
    tokensAndOwners.push([quoteTokens[i], market])
  })

  return evmSumTokens({ api, tokensAndOwners })
}

module.exports = {
  methodology: 'Token balances held in all Token Mill market vaults across Solana and Avalanche.',
  solana: { tvl: solanaTvl },
  avax: { tvl: avalancheTvl },
}
