const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults allocated by Blend Protocol.',
  blockchains: {
    btnx: {
      erc4626: [
        '0x9dF5A760820b0C8d6667eDDfc07641E0D0095616',
        '0xDF4C4A81e1b55F54E7f084e90b69817bA72821D6'
      ],
      nestedVaults: [
        '0xEBda86CB77E9e328d42bbba9B50E998d3534937D'
      ]
    },
    scroll: {
      erc4626: [
        '0xd39df22a3cd1C91B22d5E748Cc62b03eD3e8A8aD',
        '0xec5906675a92e4113a39d719c5c65a62a0995d59'
      ],
      nestedVaults: [
        '0x8a23d825467860edb4ACA0909f29D0a6A8e3a0a7',
      ]
    },
    arbitrum: {
      erc4626: [
        '0xa47c5203d22ae173788a9d9be0f2beecc97f4df9',
        '0xE3637cA4D1D6dD756dE0ecd527c40077029eCE6e',
        '0x75E9d4FEa6c408097eE4F3C63359D0dc617AcB4F',
        '0x567c1B5c2E58C66f84B80dff4C97b084B23B4E87',
        '0x9cE8A73296704d4689586347eF6e2087c2128F45'
      ],
    }
  }
}

module.exports = getCuratorExport(configs)