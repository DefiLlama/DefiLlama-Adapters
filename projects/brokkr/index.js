const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const INDEX_TOKEN_CONTRACT = { 'avax': '0xB0E2880D4429d10eF1956062B260aDf09557A1da' }
const USDC_TOKEN_CONTRACT = ADDRESSES.avax.USDC
const CALM_PORTFOLIO_CONTRACT = '0x2eAf73F8E6BCf606f56E5cf201756C1f0565C068'
const AMBITIOUS_PORTFOLIO_CONTRACT = '0x0294D02e9Fee4872e72697e9514aD0be671DB498'
const DCA_PORTFOLIO_CONTRACTS = {
  'avax': [
    "0xBbE9f28182163e767AA17072eDbeccD19DE12AE3",
    "0xF96Df0DB82Ebec3F5e8043C26522608f09c68600",
    "0x6e25e57B0Dc35eFe3688c2850568Ff59931d1182",
    "0x53f14744F15365a0323B4FF0693E9190fFBE4B62",
    "0xBAff4c732634b929033917E5dF30A52EFee554ff",
    "0xf7df7AC55F06892f52Bfe62311434bC3B9647c89"
  ]
}

async function tvl(_, _1, _2, { api }) {
  const indexToken = INDEX_TOKEN_CONTRACT[api.chain]
  const dcas = DCA_PORTFOLIO_CONTRACTS[api.chain]
  const ownerTokens = []
  if (indexToken) {
    const tokens = await api.call({ abi: "address[]:allComponents", target: indexToken })
    ownerTokens.push([tokens, indexToken])
  }
  if (dcas) {
    const depositTokens = await api.multiCall({ abi: 'address:depositToken', calls: dcas })
    const eqTokenInfo = await api.multiCall({ abi: 'function equityValuation() view returns (tuple(uint256,uint256,address)[])', calls: dcas })
    eqTokenInfo.forEach((v, i) => {
      const tokens = v.map(j => j[2])
      tokens.push(depositTokens[i])
      ownerTokens.push([tokens, dcas[i]])
    })
  }
  if (api.chain == "avax") {
    await addEquityValuationToBalances(CALM_PORTFOLIO_CONTRACT, api)
    await addEquityValuationToBalances(AMBITIOUS_PORTFOLIO_CONTRACT, api)
  }
  return sumTokens2({ api, ownerTokens, })
}

async function addEquityValuationToBalances(address, api) {
  var usdc_balance = await api.call({
    target: address,
    abi: "function getEquityValuation(bool startIndex_, bool endIndex_) view returns (uint256)",
    params: [true, false],
  })
  api.add(USDC_TOKEN_CONTRACT, usdc_balance)
}


module.exports = {
  start: 1554848955,  // 04/09/2019 @ 10:29pm (UTC)
  doublecounted: true,
  avax: {
    tvl,
  }
}; 