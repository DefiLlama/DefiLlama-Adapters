module.exports = {
  doublecounted: true,
}

const { getLogs } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  ethereum: {
    factories: [
      { factory: '0x8B46CB994218767f07C86Ba62fecAfdcb19cc001', fromBlock: 16036873, },
      { factory: '0x17F453846E407409c22621d465d2838F7DcE22aE', fromBlock: 15300131, },
    ],
    tokens: [ADDRESSES.null, ADDRESSES.ethereum.STETH, ADDRESSES.ethereum.WETH, '0x1982b2f5814301d4e9a8b0201555376e62f82428', '0xf63b34710400cad3e044cffdcab00a0f32e33ecf']
  },
  polygon: {
    factories: [
      { factory: '0x1cb9cf5439dced63d8f5b7f1a5bf9834d8076a9a', fromBlock: 34735173, },
    ],
    tokens: [ADDRESSES.null, ADDRESSES.polygon.WMATIC, ADDRESSES.polygon.MATICX, ADDRESSES.polygon.MATICX, '0x4a1c3ad6ed28a636ee1751c69071f6be75deb8b8', '0x80ca0d8c38d2e2bcbab66aa1648bd1c7160500fe']
  },
  avax: {
    factories: [
      { factory: '0x15cbFF12d53e7BdE3f1618844CaaEf99b2836d2A', fromBlock: 20869027, },
    ],
    tokens: [
      ADDRESSES.null, ADDRESSES.avax.WAVAX, ADDRESSES.avax.SAVAX,
      '0xF362feA9659cf036792c9cb02f8ff8198E21B4cB','0x4a1c3ad6ed28a636ee1751c69071f6be75deb8b8', '0x513c7E3a9c69cA3e22550eF58AC1C0088e918FFf',
      ]
  },
}

Object.keys(config).forEach(chain => {
  const { factories, tokens } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const owners = []
      for (const { factory, fromBlock, } of factories) {
        const mainAccounts = await getLogs({
          target: factory, fromBlock, api,
          eventAbi: 'event mainAccountCreate(address _userAddress, address _newAccount)',
          onlyArgs: true,
          extraKey: 'mainAccountCreate',
        })
        owners.push(...mainAccounts.map(i => i._newAccount))
        const subAccounts = await getLogs({
          target: factory, fromBlock, api,
          eventAbi: 'event subAccountCreate (address _mainAccount, address _newSubAccount)',
          onlyArgs: true,
          extraKey: 'subAccountCreate',
        })
        owners.push(...subAccounts.map(i => i._newSubAccount))
      }
      console.log(chain, owners.length, tokens.length)
      if (chain === 'avax') {
        const avaxDebt = await api.multiCall({ abi: 'function  borrowBalanceStored(address) view returns (uint256)', calls: owners, target: '0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c' })
        const avaxDebtSum = avaxDebt.reduce((acc, borrow) => acc + +borrow, 0)
        api.addGasToken(avaxDebtSum * -1)
      }
      return api.sumTokens({ owners, tokens })
    }
  }
})

/*
backup: 
`https://data.cian.app/${network}/api/v1/${accountType}?page=${page}&size=${size}
"accounts", "sub_accounts"
networks: ethereum, polygon, avalanche
*/
