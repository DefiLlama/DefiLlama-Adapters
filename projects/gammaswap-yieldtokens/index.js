const config = {
  base: 'https://api.goldsky.com/api/public/project_clut9lukx80ry01xb5ngf1zmj/subgraphs/vaults-v1-base/prod/gn'
}

const abi = {
  assetToken: 'function assetToken() view returns (address)',
  calculateNAV: 'function calculateNAV() view returns (uint256 nav, uint256 amount0, uint256 amount1, uint256 gsPnl, bool isGSPnlNeg)',
}

const firstPageQueryNoBlock = `
  query {
    vaults(first: 1000, orderBy: id, orderDirection: asc) { id }
  }
`

async function post(query, subgraphUrl) {
  const res = await fetch(subgraphUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`)
  const json = await res.json()
  if (json.errors) throw new Error(`Error: ${JSON.stringify(json.errors)}`)
  return json.data
}

async function fetchAllVaultAddresses(subgraphURL) {
  const addrs = []

    let data = await post(firstPageQueryNoBlock, subgraphURL)
    let page = data.vaults
    addrs.push(...page.map(v => v.id))
  

  return addrs
}

async function tvl(api) {

  const networks = ["base"]
  for (let i = 0; i < networks.length; i++){
    const vaults = await fetchAllVaultAddresses(config[networks[i]])
    if (!vaults.length) continue
  
    const [assets, navs] = await Promise.all([
      api.multiCall({ abi: abi.assetToken, calls: vaults.map(v => ({ target: v })) }),
      api.multiCall({ abi: abi.calculateNAV, calls: vaults.map(v => ({ target: v })) }),
    ])
  
    for (let i = 0; i < vaults.length; i++) {
      const asset = assets[i]
      const nav = navs[i]?.nav ?? navs[i]?.[0] ?? 0n
      if (!asset || !nav) continue
      api.add(asset, nav)
    }
  }
}

module.exports = {
  methodology:
    'TVL = Sum of all vault strategies by Net Asset Value (NAV)',
  base: { tvl },
}
