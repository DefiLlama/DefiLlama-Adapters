const getPactswapConfig = async () => {
  const data = await fetch(`https://app.pactswap.io/build-info.json`).then(res => res.json())
  return data
}

const COINWEB_API_URL = 'https://api-cloud.coinweb.io/wallet'

const fetchClaimsQuery = `query($contractId: String!, $firstPart: JSON!, $secondPart: JSON) {
  shard(name: BNB) {
    fetchClaimsStable(
      claimFilters: {
        keyFirstPart: $firstPart
        keySecondPart: $secondPart
        issuer: { FromSmartContract: $contractId }
      }
      offset: "0x0"
      maxClaimsToReturn: "0x64"
    ) {
      claim {
        content {
          key
          body
        }
      }
    }
  }
}
`

const fetchClaims = async (contractId, firstPart, secondPart) => {
  const data = await fetch(COINWEB_API_URL, {
    method: 'POST',
    body: JSON.stringify({ query: fetchClaimsQuery, variables: { contractId, firstPart, secondPart } })
  })
  const json = await data.json()
  return json.data.shard.fetchClaimsStable
}

const getAllC2Orders = async (contractId) => {
  const claims = await fetchClaims(contractId, ["ORDER_ACTIVE_INDEX"], null)
  const orderIds = claims.map(claim => claim.claim.content.key.second_part[1])

  const orders = await Promise.all(orderIds.map(async (orderId) => {
    const order = await fetchClaims(contractId, ["ORDER_STATE"], [orderId])
    return Array.isArray(order) ? order[0] : order
  }))

  return orders.map(order => {
    if (!order?.claim?.content?.body) {
      return null
    }
    return order.claim.content.body
  }).filter(Boolean)
}

const getAllC1Orders = async (contractId) => {
  const claims = await fetchClaims(contractId, ["ACTIVE_INDEX"], null)
  const orderIds = claims.map(claim => claim.claim.content.key.second_part[1])
  const orders = await Promise.all(orderIds.map(async (orderId) => {
    const order = await fetchClaims(contractId, ["STATE"], [orderId])
    return Array.isArray(order) ? order[0] : order
  }))
  return orders.map(order => {
    if (!order?.claim?.content?.body) {
      return null
    }
    return order.claim.content.body
  }).filter(Boolean)  
}

const chainsConfig = {
    ethereum: 'ETH',
    bsc: 'BNB',
    polygon: 'POL',
    bitcoin: 'BTC',
    litecoin: 'LTC',
    doge: 'DOGE',
    tron: 'TRX'
}
const btcLikeChains = ['BTC', 'LTC', 'DOGE']

const tvl = async (api) => {
  const chain = chainsConfig[api.chain]
  if (!chain) return 0
  const psConfig = await getPactswapConfig()
  const tokens = []

  for (const token of Object.keys(psConfig)) {
    if (token === chain || token.split('_')[1] === chain) {
      tokens.push(token)
    }
  }

  for (const token of tokens) {
    const c2ContractAddress = psConfig[token].L2_CONTRACT_ADDRESS_MAKER.id;

    const c2Orders = await getAllC2Orders(c2ContractAddress)

    let value = 0;

    for (const order of c2Orders) {
        value += Number(order.l1Amount)
    }

    const tokenAddress = psConfig[token].L1_TOKEN_ADDRESS;
    if (tokenAddress) {
      api.add(tokenAddress, value)
    } else if (btcLikeChains.includes(chain)) {
      const cgToken = api.chain === 'doge' ? 'dogecoin' : api.chain;
      api.addCGToken(cgToken, value / 10 ** 8)
    } else {
      api.addGasToken(value)
    }
  }

  return api.getBalances();
}

Object.keys(chainsConfig).forEach(chain => {
  module.exports[chain] = { tvl }
})

const tvlCoinweb = async (api) => {
  const psConfig = await getPactswapConfig()
  const c1OContractsIds = [];
  const c2OContractsIds = [];
  let cwebValue = 0;
  for (const chain of Object.values(chainsConfig)) {
    for (const token of Object.keys(psConfig)) {
      if (token === chain || token.split('_')[1] === chain) {
        c1OContractsIds.push(psConfig[token].L2_CONTRACT_ADDRESS_BASE.id)
        c2OContractsIds.push(psConfig[token].L2_CONTRACT_ADDRESS_MAKER.id)
      }
    }
  }
  const allC1Orders = await Promise.all(c1OContractsIds.map(async (contractId) => {
    return getAllC1Orders(contractId)
  }))
  const allC2Orders = await Promise.all(c2OContractsIds.map(async (contractId) => {
    return getAllC2Orders(contractId)
  }))
  for (const order of allC1Orders.flat()) {
    cwebValue += Number(order.funds)
  }
  for (const order of allC2Orders.flat()) {
    cwebValue += Number(order.collateral)
  }
  api.addCGToken('coinweb', cwebValue / 10 ** 18)
  return api.getBalances();
}

module.exports.coinweb = {
  tvl: tvlCoinweb
}