const sdk = require("@defillama/sdk")

const ADDRESS_CONFIG_ADDRESS = '0x1D415aa39D647834786EB9B5a333A50e9935b796'
const TOKEN_ADDRESS = '0x5cAf454Ba92e6F2c929DF14667Ee360eD9fD5b26'

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

async function staking(ts, block) {
  const { output: lockupAddress } = await sdk.api.abi.call({
    block,
    target: ADDRESS_CONFIG_ADDRESS,
    abi: ADDRESS_CONFIG_ABI.find(i => i.name === 'lockup')
  })
  const { output: allValue } = await sdk.api.abi.call({
    block,
    target: lockupAddress,
    abi: LOCKUP_ABI.find(i => i.name === 'getAllValue')
  })
  return {
    [TOKEN_ADDRESS]: allValue
  }
}

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking,
  }
}
