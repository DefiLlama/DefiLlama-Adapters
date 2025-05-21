const { treasuryExports } = require("../helper/treasury");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')


// https://github.com/DefiLlama/DefiLlama-Adapters/pull/12893#issuecomment-2577690389s
module.exports = treasuryExports({
  ethereum: { owners: ['0x55ac87E54019fa2e2156a0fAf13176DcdDFA16ce', '0x605b50f07f46251a7a39fa18c2247fb612f7452f', '0x3bc6b3146d48fafcfb6be35284295019fbd645e7'], },
  bsc: { owners: [ '0x3bc6b3146d48fafcfb6be35284295019fbd645e7'], },
  doge: { owners: [ 'DPQ3EbacSG6gdakZmXwMu7qS6SbpRUjY4a', 'D5gedqfZm198AyTFVg8NqWFUh8bFTdmKj7'], },
  solana: { owners: ['CeuKmW1XqgKz4E8JNpZxrysMRsvkEz55qUvm9soqhALY', 'GQkn3fPeCV4pH1MGZVHsWPpRdq5ENYnaB8GVwSubjkCZ', '8yVXip9eFwdmrbTxPqHsuCvVR5ktBdLGz7S1bUpSx7j6'] },
  bitcoin: { owners: bitcoinAddressBook.ssiProtocol },
  cardano: { owners: ['addr1v9nkv9p0gz83ha7hx0h6pg6lrte0t0dsj8tyersc8np5gegrwwxpp'] },
  ripple: { owners: ['rp53vxWXuEe9LL6AHcCtzzAvdtynSL1aVM'] },
})

Object.keys(module.exports).forEach(chain => delete module.exports[chain].ownTokens)