const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2, genericUnwrapCvx, unwrapCreamTokens } = require("../helper/unwrapLPs.js");

const vault = "0xaedcfcdd80573c2a312d15d6bb9d921a01e4fb0f";
const deployerAddresses = ["0xFd6CC4F251eaE6d02f9F7B41D1e80464D3d2F377", "0x5c46b718Cd79F2BBA6869A3BeC13401b9a4B69bB"];
const rsr = "0x320623b8E4fF03373931769A31Fc52A4E78B5d70";

const fluxTokenAddresses = [
  "0x465a5a630482f3abD6d3b84B39B29b07214d19e5", // fUSDC
  "0xe2bA8693cE7474900A045757fe0efCa900F6530b", // fDAI
  "0x81994b9607e06ab3d5cF3AffF9a67374f05F27d7", // fUSDT
  "0x1C9A2d6b33B4826757273D47ebEe0e2DddcD978B" // fFRAX
]

async function tvl(_time, block, _, { api }) {
  // First section is for RSV which will soon be deprecated
  const ownerTokens = [[[
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //usdc
    "0x8e870d67f660d95d5be530380d0ec0bd388289e1", //pax
    "0x0000000000085d4780B73119b644AE5ecd22b376", //tusd
    "0x4Fabb145d64652a948d72533023f6E7A623C7C53", //busd
  ], vault]]
  const lpBalances = {}
  const fluxBalances = {}
  const creationLogs = await _getLogs(api)

  const mains = creationLogs.map(i => i.main)
  const rTokens = creationLogs.map(i => i.rToken)

  const backingManagers = await api.multiCall({ abi: 'address:backingManager', calls: mains })
  const basketHandlers = await api.multiCall({ abi: 'address:basketHandler', calls: mains })
  const basketRes = await api.multiCall({ abi: "function quote(uint192, uint8) view returns (address[], uint256[])", calls: basketHandlers.map(i => ({ target: i, params: [0, 0] })) })
  const basketTokens = await Promise.all(basketRes.map(async ([tokens], idx) => {
    const aTokens = await api.multiCall({ abi: 'address:ATOKEN', calls: tokens, permitFailure: true, })
    
    // Update lpBalances for Curve tokens
    const cvxTokens = await api.multiCall({ abi: 'address:convexToken', calls: tokens, permitFailure: true})

    const basePools = await api.multiCall({abi: 'address:convexPool', calls: tokens, permitFailure: true})
    
    cvxTokens.forEach((v, i) => v && genericUnwrapCvx(lpBalances, tokens[i], basePools[i], block, api.chain)) 
    
    aTokens.forEach((v, i) => v && ownerTokens.push([[v], tokens[i]]))
    return tokens.filter((_, i) => !aTokens[i])
  }))

  basketTokens.forEach((tokens, i) => {
    ownerTokens.push([tokens, rTokens[i]])
    // ownerTokens.push([tokens, stRsrs[i]])
    ownerTokens.push([tokens, backingManagers[i]])
  })

  await Promise.all(ownerTokens.map(([tokens, owner]) => {
    const fluxListWithOwner = tokens.filter(token => fluxTokenAddresses.includes(token)).map(fluxToken => [fluxToken, owner])
    return fluxListWithOwner.length && unwrapCreamTokens(fluxBalances, fluxListWithOwner)
  }))
  
  const tokenBalances = await sumTokens2({ api, ownerTokens, blacklistedTokens: [rsr] })

  return {...lpBalances, ...tokenBalances, ...fluxBalances}
}

async function staking(_time, block, _, { api }) {
  const creationLogs = await _getLogs(api)
  const stRsrs = creationLogs.map(i => i.stRSR)
  return sumTokens2({ api, owners: stRsrs, tokens: [rsr] })
}

async function _getLogs(api) {
  const resLog = (await Promise.all(deployerAddresses.map(deployerAddress =>  
    getLogs({
      api,
      target: deployerAddress,
      topic: 'RTokenCreated(address,address,address,address,string)',
      fromBlock: 16680995,
      eventAbi: 'event RTokenCreated(address indexed main, address indexed rToken, address stRSR, address indexed owner, string version)',
      onlyArgs: true,
  })))).flat()
  return resLog
}

module.exports = {
  ethereum: { tvl, staking, },
  methodology: `Gets the tokens on ${vault}`,
};
