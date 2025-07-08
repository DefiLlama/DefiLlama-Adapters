const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
      '0x2910543af39aba0cd09dbb2d50200b3e800a63d2',  // - Cold Wallet
      '0xae2d4617c862309a3d75a0ffb358c7a5009c673f',  // - Hot Wallet
      '0x43984d578803891dfa9706bdeee6078d80cfc79e',  // - Internal
      '0x66c57bf505a85a74609d2c83e94aabb26d691e1f',  //  Hot Wallet
      '0xda9dfa130df4de4673b89022ee50ff26f6ea73cf',  // - Cold Wallet
      '0xa83b11093c858c86321fbc4c20fe82cdbd58e09e',  // - Hot Wallet
      '0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13',  // - Cold Wallet
      '0xe853c56864a2ebe4576a807d26fdc4a0ada51919',  // - Cold Wallet
      '0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0',  // - Hot Wallet
      '0xfa52274dd61e1643d2205169732f29114bc240b3',  // - Internal
      '0x53d284357ec70ce289d6d64134dfac8e511c8a3d',  // - Cold Wallet
      '0x89e51fA8CA5D66cd220bAed62ED01e8951aa7c40',  // - Hot Wallet
      '0xc6bed363b30df7f35b601a5547fe56cd31ec63da',  // - Hot Wallet
      '0x29728d0efd284d85187362faa2d4d76c2cfc2612',  // - Hot Wallet
      '0xe9f7eCAe3A53D2A67105292894676b00d1FaB785',  // - Hot Wallet
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.kraken,
  },
  starknet: {
    owners: [
      '0x620102ea610be8518125cf2de850d0c4f5d0c5d81f969cff666fb53b05042d2'
    ],
  },
}

module.exports = cexExports(config)
