const { transformArbitrumAddress } = require('../helper/portedTokens')
const { getCompoundV2Tvl } = require('../helper/compound')
const { staking } = require('../helper/staking')
const abi = require('./abi.json')

const cEther = '0x0706905b2b21574DEFcF00B5fc48068995FCdCdf'
const comptroller = '0xeed247Ba513A8D6f78BE9318399f5eD1a4808F8e'

function lending(borrowed) {
  return async (...params) => {
    const transformAdress = await transformArbitrumAddress()
    const balances = await getCompoundV2Tvl(
      comptroller,
      'arbitrum',
      addr => {
        // if tEth then return wEth
        if (addr === cEther) {
          return "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"
        }
        return transformAdress(addr)
      },
      cEther,
      '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
      borrowed)(...params)
    // console.log(balances)
    return Object.fromEntries(Object.entries(balances).filter(b => Number(b[1]) > 1))
  }
}

module.exports = {
  methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets.",
  timetravel: true,
  arbitrum: {
    tvl: lending(false),
  }
}
