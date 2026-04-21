const { treasuryExports } = require("../helper/treasury");
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = treasuryExports({
  solana: {
    owners: [
      'CPZmKkAhD2wv1Z21EUZvdH8ZeSD13geAnSfyVBwcW8XK', // DAO Treasury From https://docsend.com/view/bihwsdikxcpnv3kt
    ],
    ownTokens: [
      ADDRESSES.solana.JUP
    ]
  },
})
