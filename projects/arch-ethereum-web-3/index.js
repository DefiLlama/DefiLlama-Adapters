const { sumTokens2 } = require('../helper/unwrapLPs')

const sets = [
  '0xe8e8486228753E01Dbc222dA262Aa706Bd67e601',
  '0x0d20e86abab680c038ac8bbdc1446585e67f8951',
]

const chambers = [
  '0xE15A66b7B8e385CAa6F69FD0d55984B96D7263CF',
  '0x103bb3EBc6F61b3DB2d6e01e54eF7D9899A2E16B',
  '0x8F0d5660929cA6ac394c5c41f59497629b1dbc23',
  '0x89c53B02558E4D1c24b9Bf3beD1279871187EF0B'
]

const setAbi = 'address[]:getComponents'

const chamberAbi = 'address[]:getConstituentsAddresses'

async function tvl(timestamp, block, _, { api }) {
  const setsTokens = await api.multiCall({ abi: setAbi, calls: sets })
  const chambersTokens = await api.multiCall({ abi: chamberAbi, calls: chambers })
  const toa = []
  setsTokens.forEach((o, i) => toa.push([o, sets[i]]))
  chambersTokens.forEach((o, i) => toa.push([o, chambers[i]]))
  const balances = await sumTokens2({ api, ownerTokens: toa, blacklistedTokens: [...sets, ...chambers] })
  return balances
}


module.exports = {
  ethereum: {
    tvl,
  },
};