const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const INDEX_TOKEN_CONTRACT = { 
  'avax': ['0xB0E2880D4429d10eF1956062B260aDf09557A1da', '0x5C06f08807778fb84e25A00aEfafBF9C8d528267', '0xa02DDE8Ac54814c39A3Ab12EaC43B557EffFaF60'],
  'arbitrum': ['0x6b9F66564d92fed3643Cc9f86E2c21bd84171699', '0x916f7afBA53DB6A1f88e726Bc5E2278b10b9A33d']
}
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
  ],
  'arbitrum': [
    '0x4226e90a85df5C8F30b0b0C8D14388C1eCBb6E3B',
    '0x9c09B8e7E3301D92706E046d8ED633D13A0804C8',
    '0x5237efE4701b21e6A9001B58cf7fDa9D5bB6193b',
    '0xEa110407c40fC89dcaEC5067fF34206f356d1EC6',     
    '0x8639444F8511a5e2d6F979bddb75BB4e88948942'
  ]
}

async function tvl(api) {
  const indexTokens = INDEX_TOKEN_CONTRACT[api.chain]
  const dcas = DCA_PORTFOLIO_CONTRACTS[api.chain]
  const ownerTokens = []
  if (indexTokens) {
    for (let i in indexTokens) {
      let indexToken = indexTokens[i]
      const tokens = await api.call({ abi: "address[]:allComponents", target: indexToken })
      ownerTokens.push([tokens, indexToken])
    }
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
  var [usdc_balance] = await api.multiCall({
    target: address,
    abi: "function getEquityValuation(bool startIndex_, bool endIndex_) view returns (uint256)",
    calls: [{ params: [true, false] }],
    permitFailure: true,
  })
  if (!usdc_balance)
    return
  api.add(USDC_TOKEN_CONTRACT, usdc_balance)
}


module.exports = {
  start: 1554848955,  // 04/09/2019 @ 10:29pm (UTC)
  doublecounted: true,
  avax: {
    tvl,
  },
  arbitrum: {
    tvl,
  }
}; 