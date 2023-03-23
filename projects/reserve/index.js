const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require("../helper/unwrapLPs.js");

const vault = "0xaedcfcdd80573c2a312d15d6bb9d921a01e4fb0f";
const deployerAddress = "0xFd6CC4F251eaE6d02f9F7B41D1e80464D3d2F377";
const rsr = "0x320623b8E4fF03373931769A31Fc52A4E78B5d70";

async function tvl(_time, block, _, { api }) {
  // First section is for RSV which will soon be deprecated
  const ownerTokens = [[[
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //usdc
    "0x8e870d67f660d95d5be530380d0ec0bd388289e1", //pax
    "0x0000000000085d4780B73119b644AE5ecd22b376", //tusd
    "0x4Fabb145d64652a948d72533023f6E7A623C7C53", //busd
  ], vault]]
  const creationLogs = await _getLogs(api)

  const mains = creationLogs.map(i => i.main)
  const rTokens = creationLogs.map(i => i.rToken)

  const backingManagers = await api.multiCall({ abi: 'address:backingManager', calls: mains })
  const basketHandlers = await api.multiCall({ abi: 'address:basketHandler', calls: mains })
  const basketRes = await api.multiCall({ abi: "function quote(uint192, uint8) view returns (address[], uint256[])", calls: basketHandlers.map(i => ({ target: i, params: [0, 0] })) })
  const basketTokens = await Promise.all(basketRes.map(async ([tokens]) => {
    const aTokens = await api.multiCall({ abi: 'address:ATOKEN', calls: tokens })
    aTokens.forEach((v, i) => v && ownerTokens.push([[v], tokens[i]]))
    return tokens.filter((_, i) => !aTokens[i])
  }))
  basketTokens.forEach((tokens, i) => {
    ownerTokens.push([tokens, rTokens[i]])
    // ownerTokens.push([tokens, stRsrs[i]])
    ownerTokens.push([tokens, backingManagers[i]])
  })

  return sumTokens2({ api, ownerTokens, blacklistedTokens: [rsr] })
}

async function staking(_time, block, _, { api }) {
  const creationLogs = await _getLogs(api)
  const stRsrs = creationLogs.map(i => i.stRSR)
  return sumTokens2({ api, owners: stRsrs, tokens: [rsr] })
}

async function _getLogs(api) {
  return getLogs({
    api,
    target: deployerAddress,
    topic: 'RTokenCreated(address,address,address,address,string)',
    fromBlock: 16680995,
    eventAbi: 'event RTokenCreated(address indexed main, address indexed rToken, address stRSR, address indexed owner, string version)',
    onlyArgs: true,
  })
}

module.exports = {
  ethereum: { tvl, staking, },
  methodology: `Gets the tokens on ${vault}`,
};
