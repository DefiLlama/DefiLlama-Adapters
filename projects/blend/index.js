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
        '0xd56d212777d25cb3923B515fe0D12E3fd10081AD'
      ],
    }
  }
}

module.exports = getCuratorExport(configs)