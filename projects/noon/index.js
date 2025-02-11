const { nullAddress } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk')

const contracts = {
  ethereum: {
    usn: '0xdA67B4284609d2d48e5d10cfAc411572727dc1eD',
    susn: '0xE24a3DC889621612422A64E6388927901608B91D',
  },
  sophon: {
    usn: '0xC1AA99c3881B26901aF70738A7C217dc32536d36',
    susn: '0xb87dbe27db932bacaaa96478443b6519d52c5004',
  },
  era: {
    usn: '0x0469d9d1dE0ee58fA1153ef00836B9BbCb84c0B6',
    susn: '0xB6a09d426861c63722Aa0b333a9cE5d5a9B04c4f',
  }
}

function tvl(chain) {
  return async (api) => {
    const { usn } = contracts[chain]
    const supply = await api.call({ target: usn, abi: 'erc20:totalSupply' })
    api.add(usn, supply)
  }
}

function staking(chain) {
  return async (api) => {
    const { usn, susn } = contracts[chain]
    const balance = await api.call({
      target: usn,
      params: [susn],
      abi: 'erc20:balanceOf'
    })
    api.add(usn, balance)
  }
}

module.exports = {
  methodology: "TVL is total supply of USN tokens. Staking is USN balance in sUSN contract.",
  ethereum: {
    tvl: tvl('ethereum'),
  },
  sophon: {
    tvl: tvl('sophon')
  },
  era: {
    tvl: tvl('era')
  },
  hallmarks: [
    [1737979200, "Public Beta"]
  ]
}
