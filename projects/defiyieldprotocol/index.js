const { tokenHolderBalances } = require('../helper/tokenholders')

module.exports = {
  start: 1619654324,        // Apr-28-2021 23:58:44 PM +UTC
  tvl: tokenHolderBalances([
    {
      tokens: [
        '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5', // cETH Token
        '0xccF4429DB6322D5C611ee964527D42E5d685DD6a', // cWBTC Token
        '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9', // cUSDT Token
        '0x39AA39c021dfbaE8faC545936693aC917d5E7563', // cUSDC Token
        '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', // cDAI Token
      ],
      holders: [
      	'0x01de5bCe5C5Ee4F92e8f4183f6F4E4f12f9a86cd', // cETH Vault 3 Days Lock
      	'0x3e488684c40D63Ff2b9963DFBb805Bbb3Da9b1c6', // cETH Vault 30 Days Lock
      	'0x480c83Be2694BFB91F40d951424330c9123b9066', // cETH Vault 60 Days Lock
      	'0xdC68450BfE4E16d74B20c44DdA83662cF2F5F0c0', // cETH Vault 90 Days Lock
      	'0xe5c5a452A0f7B2d5266010Bf167A7Ee2eDF54533', // cWBTC Vault 3 Days Lock
      	'0x8Ae8eC53712017EeB3378Ee112082D57da98E792', // cWBTC Vault 30 Days Lock
      	'0x2D4b96e3C6176E833c013088aEcC7640af977e20', // cWBTC Vault 60 Days Lock
      	'0xb95Ec2cB2D61d12c86a05e0c995d007Aec8f2850', // cWBTC Vault 90 Days Lock
      	'0x18d2a323675BbE1f9d03e273a186Aea8ADf7f5c5', // cUSDT Vault 3 Days Lock
      	'0xfB55dcc985517d111C65004f0EAabC1f6CE23cF1', // cUSDT Vault 30 Days Lock
      	'0x8CE610eC56cE3ad3678C426f0Dfc965568Db6DdC', // cUSDT Vault 60 Days Lock
      	'0x7CCFF41652eD12278E02E18de06d40Aaf5F1769B', // cUSDT Vault 90 Days Lock
      	'0x94226Ae99C786b2830d27aC6e8fCdb4b0c4cc73a', // cUSDC Vault 3 Days Lock
      	'0xaaC6814a1aCFE8F7Ea1f718148daC614d5323c85', // cUSDC Vault 30 Days Lock
      	'0xe19328D2A528B765E30f9BC47faBb81e0f510ea9', // cUSDC Vault 60 Days Lock
      	'0xE728874B81Bd0b7a9c3505949935e67D0e7136aD', // cUSDC Vault 90 Days Lock
      	'0x8c1d0FD28b5FEac7f5521d05D53d7E1560A7CBCC', // cDAI Vault 30 Days Lock
      	'0xF73baaC19eEEB7C4B7Cc211F3eDF88BB9F1d40f9', // cDAI Vault 30 Days Lock
      	'0x8Fb2c9F8c07FaCf0aF442a1900cD2Cfe1940971B', // cDAI Vault 60 Days Lock
      	'0x8ad8e5FA0f2781dA3327275049B5469275A1042E', // cDAI Vault 90 Days Lock
      ],
      checkETHBalance: true,
    }
  ])
}
