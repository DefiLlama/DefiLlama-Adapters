const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        ADDRESSES.ethereum.WETH,
        '0x7d87123d92e9df257e0789189e4c4ff67fa6c382',
     ],
    owners: ['0x3D027824a9Eb4cc5E8f24D97FD8495eA9DC7026F'],
    ownTokens: ['0xF75C7a59bCD9bd207C4Ab1BEB0b32EEd3B6392f3'],
    resolveLP: true,
  },
})
