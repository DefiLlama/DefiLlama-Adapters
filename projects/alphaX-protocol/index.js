const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

const tokens = [
  ADDRESSES.ethereum.USDT,
  ADDRESSES.arbitrum.USDT
];

const owners = [
  '0x95e2A6458419b7A38193CB853F45fD7329443A90',
  '0x70eF5649c0b51162C62CE38d807b8aD61Ac2560d',

];


const walletAddresses = {
 ethereum: ['0xA61a6E696B7C566DA42B80dA27d96e7104bcec99','0x95e2A6458419b7A38193CB853F45fD7329443A90'],
 arbitrum: ['0x552E7A55802f3350C707a243E402aa50Eda9D286']
 
};

const tokenAddress = {
  ethereum: [ADDRESSES.ethereum.USDT],
  arbitrum: [ADDRESSES.arbitrum.USDT],

 
}

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners: walletAddresses.ethereum, tokens: tokenAddress.ethereum }),
  },
  arbitrum: {
    tvl: sumTokensExport({ owners: walletAddresses.arbitrum, tokens: tokenAddress.arbitrum }),
  },
 
};
