const { sumTokensExport } = require('../helper/solana')
const { sumTokensExport: evmSumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// DARKPOOL's shielded pool. On Solana every shielded coin sits in its own reserve token account: PDA
// ['reserve', mint] of program Gj6tgwJ8bKMUUoSxWrk57APLZbk6gJ17yFnQy8HA2qoK, owned by the pool state account
// 9aM43RjPFqpzTia2mMcMEoKTm9gjpD56tDhWTirUY9yy. $DARKPOOL's own reserve (A5rCK2MaqCrEtDKabvLZKofGRhxVMSkE2RQCa7caEaXa)
// is left out: it is the protocol's own token.
const SOLANA_RESERVES = [
  'GiAQ7rzzg2YgAy3CQPiZwBjiKNS1YLH8rA5JDkPbEpnq', // SOL (wrapped)
  'xN7TxTK34qp2Q9Rn3PLP6a5qNdmthG44fNZf1ZWG4a1', // USDC
  '5qsEUQyvJKYa187jB31LhNi2NQrxtzDqZrfNPe6fzsAX', // JupUSD
  'B14NEaxHeapADRSwHL9XpyGwdpY8CDvgYxrD3eAqHScJ', // jlUSDC
  'CNQRun6eJsxGBinXmSWrUvaem6sM23ogq7Dox3jMNRDT', // 5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm
  'ES6JNrtdsjpomzguDxESdqyd39r8xBdMUssdEXN2yi5c', // 7KEPApdbBMByrmqihz3bht2uMhFQcatjfSFQCKq66kH3
  'G49HWB8aR4D9VECCALodKt8kDw3TiCwESb7AY1NBTy7V', // 6GmAFSYs4gk3FDao5FzzySQpPZaWsa4rUJHacpMpUNgx
  'GAMZQTybausLPtkJr35pJ2XHjaDNDyiAicAJsms9KMUj', // J8PSdNP3QewKq2Z1JJJFDMaqF7KcaiJhR7gbr5KZpump
  'AuVLFY1QjCCg1ZvucLFGurUEyZ3vApcufFvvmcFJEJ6g', // MukLDtJ8Cx9DxLbeyLRSWPSposTMWuwHANbuaudpump
  '2PuFxjGeqx5UaUbF7gao4p2uwxKhGKGQmgfD9rght6Cv', // GoADAwux19tGxb3W4ykPzZz8p5JCSYaxBRpuW7s9pump
]
// The Robinhood Chain pool contract (holds shielded ETH and tokens)
const ROBINHOOD_POOL = '0xEB66bd2d7d29f1F29a19C88cE4b2035D4571076E'

module.exports = {
  methodology: 'Coins deposited (shielded) into the DARKPOOL private pool: the pool\'s reserve token accounts on Solana and the pool contract on Robinhood Chain. $DARKPOOL, the protocol\'s own token, is excluded.',
  solana: {
    tvl: sumTokensExport({ tokenAccounts: SOLANA_RESERVES }),
  },
  robinhood: {
    tvl: evmSumTokensExport({ owner: ROBINHOOD_POOL, tokens: [ADDRESSES.null, ADDRESSES.robinhood.WETH, ADDRESSES.robinhood.USDG] }),
  },
}
