
const abi = require('./abi.json');
const { sumTokensExport, sumTokens2 } = require("../helper/unwrapLPs");
const AXIAL_JLP_TOKEN = "0x5305A6c4DA88391F4A9045bF2ED57F4BF0cF4f62";
const AXIAL_MASTERCHEF_V3 = "0x958C0d0baA8F220846d3966742D4Fb5edc5493D3";

async function tvl(api) {
  const pools = (await api.fetchList({  lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: AXIAL_MASTERCHEF_V3})).map(i => i.lpToken)
  const vaults = (await api.multiCall({  abi: abi.owner, calls: pools, permitFailure: true,})).filter(i => i)
  const params = [0, 1, 2, 3,]
  const calls = vaults.map(v => params.map(i => ({ target: v, params:[i]}))).flat()
  const owners = calls.map(i => i.target)
  const tokens  = await api.multiCall({  abi: abi.getToken, calls, permitFailure: true, })
  const tokensAndOwners = tokens.map((t, i) => [t, owners[i]]).filter(i => i[0])
  return sumTokens2({ api, tokensAndOwners,})
}

module.exports = {
  methodology: "Our TVL is the value of the tokens within the Axial pools, and the Axial LP tokens within our rewards pools MasterChef",
  avax:{
    tvl,
    pool2: sumTokensExport({ owner: AXIAL_MASTERCHEF_V3, tokens: [AXIAL_JLP_TOKEN]})
  }
}
