const ADDRESSES = require('../helper/coreAssets.json')
const config = {
  abstract: {
    gacha: '0x3272596F776470D2D7C3f7dfF3dc50888b7D8967',
    // getConfig()/getPool() started reverting on every RPC; pool tokens below were read from the
    // contract at abstract block 58646384 (18 pools) and are now static
    tokens: [
      ADDRESSES.abstract.WETH,
      ADDRESSES.abstract.USDC,
      '0x9eBe3A824Ca958e4b3Da772D2065518F009CBa62',
      '0x8041FbC255d6E6330E92a61325da515656bFD2dd',
      '0x85Ca16Fd0e81659e0b8Be337294149E722528731',
      '0xc325b7e2736A5202bd860F5974D0AA375E57EdE5',
      '0xd045e0686A784e272E651Fc2C08324edABE7403A',
      '0x52629ddBf28AA01Aa22B994Ec9c80273e4Eb5B0A',
      '0x987CF44F3F5d854eC0703123d7fD003a8b56eBb4',
      '0xDf70075737E9F96B078ab4461EeE3e055E061223',
      '0x60ED5CE0D66554AC63EDD35F4F91181f747Ae8C6',
      '0xdC70311f4B19774828aA4a57520a7153AF5E58a5',
      '0x140F881932cE4EF84a54b20Eda31bBB1E3a137Ad',
      '0x775fEc18BE7B2E71c1A20C22f89A697D07C04399',
      '0x75fdeF6C412e22Bd561F671d7c4d4899859F94ba',
      '0xAf31d07AF1602Dfce07Fba81BcA5F9570CA83983',
      '0x7EcCB7cc2338c15f15AdaF457135031670F0a7A8',
      '0xEA08d82824E871a163fDeB7D7C6000521f1Be4DD',
    ],
  },
}

async function tvl(api) {
  const { gacha, tokens } = config[api.chain]
  return api.sumTokens({ owner: gacha, tokens })
}

module.exports = {
  methodology: 'TVL consists of total token balances held by the Gacha contract pools.',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
