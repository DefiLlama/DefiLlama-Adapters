const { getLogs } = require('../helper/cache/getLogs')

const trancheFactoryAddress = "0x62F161BF3692E4015BefB05A03a94A40f520d1c0";
const ccpFactory = '0xb7561f547F3207eDb42A6AfA42170Cd47ADD17BD';
const balVault = '0xBA12222222228d8Ba445958a75a0704d566BF2C8'

const wps = [
  '0xD5D7bc115B32ad1449C6D0083E43C87be95F2809',
  '0xDe620bb8BE43ee54d7aa73f8E99A7409Fe511084',
  '0x67F8FCb9D3c463da05DE1392EfDbB2A87F8599Ea',
  '0xF94A7Df264A2ec8bCEef2cFE54d7cA3f6C6DFC7a',
  '0xE54B3F5c444a801e61BECDCa93e74CdC1C4C1F90',
  '0x2D6e3515C8b47192Ca3913770fa741d3C4Dac354',
  '0xd16847480D6bc218048CD31Ad98b63CC34e5c2bF',
  '0x7320d680Ca9BCE8048a286f00A79A2c9f8DCD7b3',
  '0x9e030b67a8384cbba09D5927533Aa98010C87d91'
]

const abis = {
  "underlying": "address:underlying",
  "tranche": "address:tranche",
  "valueSupplied": "uint256:valueSupplied",
  "getPoolId": "function getPoolId() view returns (bytes32)",
  "getPoolTokens": "function getPoolTokens(bytes32 poolId) view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)"
}

const eventAbis = {
  trancheCreated: 'event TrancheCreated (address indexed trancheAddress, address indexed wpAddress, uint256 indexed expiration)',
  ccPoolCreated: "event CCPoolCreated(address indexed pool, address indexed bondToken)"
}

const trancheTvl = async (api) => {
  const tranchesLogs = await getLogs({ api, extraKey: 'tranche', target: trancheFactoryAddress, eventAbi: eventAbis.trancheCreated, fromBlock: 12685765, onlyArgs: true })
  const tranches = tranchesLogs.map(i => i.trancheAddress)
  const [underlyings, valueSupplies] = await Promise.all([
    api.multiCall({ abi: abis.underlying, calls: tranches }),
    api.multiCall({ abi: abis.valueSupplied, calls: tranches })
  ])
  api.add(underlyings, valueSupplies)
}

const wpTvl = async (api) => {
  const poolIds = await api.multiCall({ calls: wps, abi: abis.getPoolId })
  const poolTokens = (await api.multiCall({ calls: poolIds.map((id) => ({ target: balVault, params: [id] })), abi: abis.getPoolTokens }))
  poolTokens.forEach(({ tokens, balances }) => { 
    api.add(tokens,balances)
   })
}

const ccTvl = async (api) => {
  const ccsLogs = (await getLogs({ api, extraKey: 'ccs', target: ccpFactory, fromBlock: 12686198, eventAbi: eventAbis.ccPoolCreated, onlyArgs: true })).map(i => i.pool)
  const poolIds = await api.multiCall({ calls: ccsLogs, abi: abis.getPoolId })
  const poolTokens = (await api.multiCall({ calls: poolIds.map((id) => ({ target: balVault, params: [id] })), abi: abis.getPoolTokens })) 
  poolTokens.forEach(({ tokens, balances }) => { 
    api.add(tokens,balances)
   })
}


const tvl = async (api) => {
  await trancheTvl(api)
  await wpTvl(api)
  await ccTvl(api)
}

module.exports = {
  ethereum: { tvl }
}