const ADDRESSES = require('../coreAssets.json')
const coinAddresses = {
  weth: ADDRESSES.ethereum.WETH, //Ethereum
  ftm: ADDRESSES.ethereum.FTM,  //Fantom
  matic: ADDRESSES.ethereum.MATIC, //Matic
  dot: ADDRESSES.ethereum.MATIC, //DOT
  avax: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", //Avalanche
};

module.exports = coinAddresses;