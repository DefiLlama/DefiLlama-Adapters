const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
  methodology:
    `Flashloan pools: sum of all available liquidity
         Lend-borrow contracts: sum of tokens provided as collateral and tokens provided by lenders
         Elastic-Modules: sum of tokens provided by hedgers and amount of tokens to hedge
        `,
}

const config = {
  ethereum: {
    flashloan: '0x2e5a08c26cb22109e585784c4f99363bb3e199ab', tokensAndOwners: [
      // em
      ['0x28e598846febb750effc384853fbce82988eaaa2', '0x95142849d31eaa20b5b9ab746dff27ff400ce6bf'],
      [ADDRESSES.ethereum.sUSD, '0xce596bf99d21e46fa91143c03d7a356682b67859'],
      [ADDRESSES.ethereum.sUSD, '0xb7ead8c418f3d03bc22dd538c22600abe7209e72'],
      ['0xba100000625a3754423978a60c9317c58a424e3D', '0x78E52d69fA8e0F036fFEF0BcDc4C289DB0DF63E2'],
      [ADDRESSES.ethereum.USDC, '0x87B46E49681E08E3adDF8A90F6a1fb5183079033'],
      [ADDRESSES.ethereum.USDC, '0xcB72e764Ab46535aAD13cbF55b1F06cB15347A95'],

      // lend-borrow
      [ADDRESSES.ethereum.WETH, '0xb3e1912fa5d9d219da8c65cda407cc998849428b'],
      ['0xBcca60bB61934080951369a648Fb03DF4F96263C', '0x8ac9425260b6da02db07da7980b09525ebf3b6a0'],
      ['0x028171bCA77440897B824Ca71D1c56caC55b68A3', '0x45d5a790da3bfa305efca81eac652678ae3a90a6'],
    ]
  },
  polygon: {
    flashloan: '0xCAFDa65B1031535F1766C6b1E3b5efF5520c7C0f', tokensAndOwners: [
      // lend-borrow        
      [ADDRESSES.polygon.WMATIC_2, '0x2F35d311fd2F0b0dA65FA268B86831279FB4fd98'],
      ['0x1a13f4ca1d028320a707d99520abfefca3998b7f', '0xbfb5215aD157Cd6C8B22494dC54Ff4B74bA18C09'],
      ['0x27f8d03b3a2196956ed754badc28d73be8830a6e', '0x0Cf91744D15684b91E6705e56f6dC820647B3067'],
    ]
  },
}

Object.keys(config).forEach(chain => {
  const { flashloan, tokensAndOwners = [] } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const fTokens = await api.fetchList({ lengthAbi: 'N_TOKENS', itemAbi: 'TOKENS', target: flashloan })
      fTokens.forEach(fToken => tokensAndOwners.push([fToken, flashloan]))
      await api.sumTokens({ tokensAndOwners })
    }
  }
})