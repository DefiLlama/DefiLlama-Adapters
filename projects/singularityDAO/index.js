const abi = require('./abi.json')
const http = require('../helper/http')
const sdk = require("@defillama/sdk")
const BigNumber = require("bignumber.js")
const { sumTokens } = require("../helper/unwrapLPs")
const { addFundsInMasterChef } = require('./masterchef')
const NuNut_TOKEN = '0xF0d33BeDa4d734C72684b5f9abBEbf715D0a7935'
const SDAO_TOKEN = '0x993864E43Caa7F7F12953AD6fEb1d1Ca635B875F'
const AGIX_TOKEN = '0x5B7533812759B45C2B44C19e320ba2cD2681b542'


const getDynasetQuery = '{ dynaset { addresses { chainId value __typename } } }'
const graphEndpoint = 'https://dev-onchain-server.singularitydao.ai/dynaset-server/api/graphql'

async function tvl(ts, block) {
  const balances = {}
  const response = await http.graphQuery(graphEndpoint, getDynasetQuery)
  const dynasets = response.dynaset.map(d => d.addresses.map(a => a.value)).flat()
  const { output: tokens } = await sdk.api.abi.multiCall({
    calls: dynasets.map(addr => ({ target: addr })),
    abi: abi.getCurrentTokens,
    block
  })
  const tokensAndOwners = []
  tokens.map((t, index) => t.output.forEach(token => tokensAndOwners.push([token, dynasets[index]])))
  await sumTokens(balances, tokensAndOwners, block)
  return balances
}

async function pool2(ts, block) {
  const balances = {}
  await addFundsInMasterChef({ balances, block, masterchef: '0xfB85B9Ec50560e302Ab106F1E2857d95132120D0', skipTokens: [NuNut_TOKEN, SDAO_TOKEN, AGIX_TOKEN,] })
  await addFundsInMasterChef({ balances, block, masterchef: '0xb267deaace0b8c5fcb2bb04801a364e7af7da3f4', skipTokens: [NuNut_TOKEN, SDAO_TOKEN, AGIX_TOKEN,] })
  return balances
}

async function staking(ts, block) {
  const balances = {}
  const tokensAndOwners = [
    [NuNut_TOKEN, '0xb267deaace0b8c5fcb2bb04801a364e7af7da3f4'],
    [NuNut_TOKEN, '0x502B965d3D51d4FD531E6A1c1fA9bFA50337bA55'],
    [SDAO_TOKEN, '0xfB85B9Ec50560e302Ab106F1E2857d95132120D0'],
    [SDAO_TOKEN, '0x74641ed232dbB8CBD9847484dD020d44453F0368'],
    [SDAO_TOKEN, '0xF5738B4aD2f8302b926676692a0C09603d930b42'],
  ]
  await sumTokens(balances, tokensAndOwners, block)
  return balances
}


module.exports = {
  doublecounted: false,
  ethereum: {
    tvl,
    staking,
    pool2,
  }
}
