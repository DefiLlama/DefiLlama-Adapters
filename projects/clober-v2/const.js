const CONTRACT_INFOS = {
  base: {
    bookManagerContract: {
      address: '0x382CCccbD3b142D7DA063bF68cd0c89634767F76',
      fromBlock: 14528050,
      abi: {
        openEvent: 'event Open(uint192 indexed id, address indexed base, address indexed quote, uint64 unitSize, uint24 makerPolicy, uint24 takerPolicy, address hooks)',
      }
    }
  },
  era: {
    bookManagerContract: {
      address: '0xAaA0e933e1EcC812fc075A81c116Aa0a82A5bbb8',
      fromBlock: 34448160,
      abi: {
        openEvent: 'event Open(uint192 indexed id, address indexed base, address indexed quote, uint64 unitSize, uint24 makerPolicy, uint24 takerPolicy, address hooks)',
      }
    }
  },
}

const zeroAddress = '0x0000000000000000000000000000000000000000'

module.exports = {
  CONTRACT_INFOS,
  zeroAddress
}