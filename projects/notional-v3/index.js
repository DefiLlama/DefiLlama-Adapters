const { sumTokens2 } = require('../helper/unwrapLPs');
const abi = require('../notional/abi');
const { graphQuery } = require('../helper/http')

const SUBGRAPHS = {
  arbitrum: 'https://api.studio.thegraph.com/query/36749/notional-v3-arbitrum/version/latest'
};
const vaultsQuery = `
{
    oracles(where: {
      matured: false,
      oracleType_in: [
        VaultShareOracleRate
      ],
    }, first: 1000) {
      base { id }
      quote { id symbol }
      decimals
      oracleType
      latestRate
    }
    vaultShare: tokens(where: { tokenType: VaultShare}) {
      id
      symbol
      totalSupply
      currencyId
      underlying {id symbol decimals}
    }
  }
`


const contract = "0x1344A36A1B56144C3Bc62E7757377D288fDE0369"

async function vaultTVL(chain) {
  const vaults = await graphQuery(SUBGRAPHS[chain], vaultsQuery)
  const vaultTVL = vaults['vaultShare'].reduce((sumPerUnderlying, v) => {
    const rate = vaults['oracles'].find((o) => o.quote.id === v.id)?.latestRate
    const totalSupply = v['totalSupply']
    if (rate && totalSupply) {
      // Vault oracle rate includes decimal conversion
      const tvl = BigInt(rate) * BigInt(totalSupply) / BigInt(1e8)
      if (sumPerUnderlying[v['underlying']['id']]) {
        sumPerUnderlying[v['underlying']['id']] += tvl
      } else {
        sumPerUnderlying[v['underlying']['id']] = tvl
      }
    }

    return sumPerUnderlying
  }, {})

  const vaultUnderlyingTokens = Object.keys(vaultTVL)
  const vaultBalances = vaultUnderlyingTokens.map((t) => Number(vaultTVL[t]))
  return {
    vaultUnderlyingTokens,
    vaultBalances
  }
}

async function tvl(timestamp, block, _, { api }) {
  let oracles = await api.fetchList({ lengthAbi: abi.getMaxCurrencyId, itemAbi: abi.getPrimeCashHoldingsOracle, target: contract, startFromOne: true, })
  let underlying = await api.multiCall({ abi: 'address:underlying', calls: oracles.map((o) => ({ target: o})) })
  let holdings = await api.multiCall({ abi: 'address[]:holdings', calls: oracles.map((o) => ({ target: o})) })
  let tokens = underlying.concat(holdings.flatMap((_) => _))

  const { vaultUnderlyingTokens, vaultBalances } = await vaultTVL("arbitrum")
  api.addTokens(vaultUnderlyingTokens, vaultBalances)
  return sumTokens2({ tokens, owner: contract, api })
}

module.exports = {
  arbitrum: { tvl }
};