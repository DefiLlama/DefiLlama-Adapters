const { sumTokens2 } = require('../helper/unwrapLPs')

const sets = [
  '0xe8e8486228753E01Dbc222dA262Aa706Bd67e601',
  '0x0d20e86abab680c038ac8bbdc1446585e67f8951',
]

const chambers = [
  '0xE15A66b7B8e385CAa6F69FD0d55984B96D7263CF',
  '0x103bb3EBc6F61b3DB2d6e01e54eF7D9899A2E16B',
  '0x8F0d5660929cA6ac394c5c41f59497629b1dbc23',
  '0x89c53B02558E4D1c24b9Bf3beD1279871187EF0B',
  '0xd1Ce69B4bDd3Dda553Ea55A2a57c21C65190F3D5'
]

const polygonChambers = [
  '0xde2925d582fc8711a0e93271c12615bdd043ed1c',
]

const strategies = ['0x4e39ceae6e771605ddd7d1121f3320f7a2319318']

const setAbi = 'address[]:getComponents'

const chamberAbi = 'address[]:getConstituentsAddresses'

async function tvl(api) {
  const setsTokens = await api.multiCall({ abi: setAbi, calls: sets })
  const chambersTokens = await api.multiCall({ abi: chamberAbi, calls: chambers })
  const toa = []
  setsTokens.forEach((o, i) => toa.push([o, sets[i]]))
  chambersTokens.forEach((o, i) => toa.push([o, chambers[i]]))
  const balances = await sumTokens2({ api, ownerTokens: toa, blacklistedTokens: [...sets, ...chambers, ...strategies] })

  // Add vaults
  await api.erc4626Sum({ calls: strategies, balanceAbi: 'totalAssets', tokenAbi: "asset" })

  return balances
}

async function polygonTvl(api) {
  const chambersTokens = await api.multiCall({ abi: chamberAbi, calls: polygonChambers })
  const toa = []
  chambersTokens.forEach((o, i) => toa.push([o, polygonChambers[i]]))
  const balances = await sumTokens2({ api, ownerTokens: toa, blacklistedTokens: polygonChambers })
  return balances
}


module.exports = {
  ethereum: {
    tvl,
  },
  polygon: {
    tvl: polygonTvl,
  }
};