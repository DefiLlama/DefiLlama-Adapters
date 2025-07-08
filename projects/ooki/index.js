const { sumTokens2 } = require('../helper/unwrapLPs')
const { stakings } = require("../helper/staking");

const abi = require('./abi');
const registry = require('./registry');

const contracts = {
  ethereum: {
    'protocol': '0xD8Ee69652E4e4838f2531732a46d1f7F584F0b7f',
    'registry': '0xf0E474592B455579Fe580D610b846BdBb529C6F7',
  },
  polygon: {
    'protocol': '0x059D60a9CEfBc70b9Ea9FFBb9a041581B1dFA6a8',
    'registry': '0x4B234781Af34E9fD756C27a47675cbba19DC8765',
  },
  bsc: {
    'protocol': '0xD154eE4982b83a87b0649E5a7DDA1514812aFE1f',
    'registry': '0x1BE70f29D30bB1D325E5D76Ee73109de3e50A57d',
  },
  arbitrum: {
    'protocol': '0x37407F3178ffE07a6cF5C847F8f680FEcf319FAB',
    'registry': '0x86003099131d83944d826F8016E09CC678789A30',
  },
  optimism: {
    'protocol': '0xAcedbFd5Bc1fb0dDC948579d4195616c05E74Fd1',
    'registry': '0x22a2208EeEDeb1E2156370Fd1c1c081355c68f2B',
  }
}

async function getBalances(api, isBorrowed) {
  const network = api.chain ?? 'ethereum'
  const info = await api.call({
    target: contracts[network].registry,
    params: [0, 200],
    abi: registry.getTokens
  })
  if (!isBorrowed)
    return sumTokens2({ api, tokensAndOwners: info.map(i => [i.asset, i.token]) })

  const borrowedBals = await api.multiCall({ abi: abi.totalAssetBorrow, calls: info.map(i => i.token) })
  api.addTokens(info.map(i => i.asset), borrowedBals)
}

let ooki = '0x0De05F6447ab4D22c8827449EE4bA2D5C288379B'
let bzrx = '0x56d811088235F11C8920698a204A5010a788f4b3'

let stakingContracts = [
  '0xe95Ebce2B02Ee07dEF5Ed6B53289801F7Fc137A4',
  '0x16f179f5c344cc29672a58ea327a26f64b941a63'
]

Object.keys(contracts).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => getBalances(api, false),
    borrowed: async (api) => getBalances(api, true),
  }
})
module.exports.ethereum.staking = stakings(stakingContracts, [ooki, bzrx])

module.exports.arbitrum.borrowed = ()  => ({})
module.exports.polygon.borrowed = ()  => ({})
module.exports.bsc.borrowed = ()  => ({})
module.exports.arbitrum.borrowed = ()  => ({})
module.exports.optimism.borrowed = ()  => ({})
module.exports.ethereum.borrowed = ()  => ({})
module.exports.deadFrom = '2025-05-01' 