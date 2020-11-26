var Web3 = require('web3')
const env = require('dotenv').config()
const utils = require('./helper/utils')
const BigNumber = require('bignumber.js')

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`
  )
)

const ADDRESS_CONFIG_ADDRESS = '0x1D415aa39D647834786EB9B5a333A50e9935b796'
const TOKEN_ADDRESS = '0x5cAf454Ba92e6F2c929DF14667Ee360eD9fD5b26'
const TOKEN_ID = 'dev-protocol'

const ADDRESS_CONFIG_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'lockup',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]

const LOCKUP_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_config',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    constant: true,
    inputs: [],
    name: 'getAllValue',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]

const KEYS = [
  {
    TOKEN_ADDRESS: TOKEN_ID,
  },
]

async function fetch() {
  const addressConfigInstance = await new web3.eth.Contract(
    ADDRESS_CONFIG_ABI,
    ADDRESS_CONFIG_ADDRESS
  )
  const lockupAddress = await addressConfigInstance.methods.lockup().call()
  const lockupInstance = await new web3.eth.Contract(LOCKUP_ABI, lockupAddress)
  const allValue = await lockupInstance.methods.getAllValue().call()
  const priceFeed = await utils.getPrices(KEYS)
  const price = priceFeed.data[TOKEN_ID].usd
  const decimals = await utils.returnDecimals(TOKEN_ADDRESS)
  const tvl = new BigNumber(allValue).div(10 ** decimals).times(price)
  return parseFloat(tvl.toString())
}

module.exports = {
  fetch,
}
