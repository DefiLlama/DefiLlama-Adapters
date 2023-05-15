const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2, genericUnwrapCvxDeposit, unwrapCreamTokens } = require("../helper/unwrapLPs.js");

const vault = "0xaedcfcdd80573c2a312d15d6bb9d921a01e4fb0f";
const deployerAddresses = ["0xFd6CC4F251eaE6d02f9F7B41D1e80464D3d2F377", "0x5c46b718Cd79F2BBA6869A3BeC13401b9a4B69bB"];
const rsr = "0x320623b8E4fF03373931769A31Fc52A4E78B5d70";

async function tvl(_time, block, _, { api }) {
  // First section is for RSV which will soon be deprecated
  const ownerTokens = [[[
    ADDRESSES.ethereum.USDC, //usdc
    "0x8e870d67f660d95d5be530380d0ec0bd388289e1", //pax
    ADDRESSES.ethereum.TUSD, //tusd
    ADDRESSES.ethereum.BUSD, //busd
  ], vault]]
  const blacklistedTokens = [rsr]
  const fluxListWithOwner = []
  const creationLogs = await _getLogs(api)

  const mains = creationLogs.map(i => i.main)
  const rTokens = creationLogs.map(i => i.rToken)

  const backingManagers = await api.multiCall({ abi: 'address:backingManager', calls: mains })
  const basketHandlers = await api.multiCall({ abi: 'address:basketHandler', calls: mains })
  const basketRes = await api.multiCall({ abi: "function quote(uint192, uint8) view returns (address[], uint256[])", calls: basketHandlers.map(i => ({ target: i, params: [0, 0] })) })
  await Promise.all(basketRes.map(async ([tokens], idx) => {
    const rToken = rTokens[idx]
    const manager = backingManagers[idx]
    const names = await api.multiCall({ abi: 'string:name', calls: tokens, })

    // handle Atokens
    const aTokenBases = tokens.filter((_, i) => names[i].startsWith('Static '))
    tokens = tokens.filter((_, i) => !names[i].startsWith('Static '))
    const aTokens = await api.multiCall({ abi: 'address:ATOKEN', calls: aTokenBases})
    blacklistedTokens.push(...aTokenBases)
    aTokens.forEach((v, i) => ownerTokens.push([[v], aTokenBases[i]]))

    // handle flux and convex deposit tokens
    const baseTokens = tokens.filter((_, i) => names[i].endsWith('Convex Deposit'))
    const fluxTokens = tokens.filter((_, i) => names[i].startsWith('Flux '))
    blacklistedTokens.push(...baseTokens)
    blacklistedTokens.push(...fluxTokens)
    tokens = tokens.filter((_, i) => !names[i].endsWith('Convex Deposit'))
    tokens = tokens.filter((_, i) => !names[i].startsWith('Flux '))
    fluxTokens.forEach(token => {
      fluxListWithOwner.push([token, rToken])
      fluxListWithOwner.push([token, manager])
    })
    // Update lpBalances for Curve tokens
    await Promise.all(baseTokens.map((token) => genericUnwrapCvxDeposit({ api, token, owner: rToken })))
    await Promise.all(baseTokens.map((token) => genericUnwrapCvxDeposit({ api, token, owner: manager })))

    ownerTokens.push([tokens, rToken])
    ownerTokens.push([tokens, manager])
  }))
  await unwrapCreamTokens(api.getBalances(), fluxListWithOwner, block)

  await sumTokens2({ api, ownerTokens, blacklistedTokens })
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
