const { getProvider } = require('../helper/solana')
const { Program } = require('@project-serum/anchor')
const idl = {
  "version": "0.1.0",
  "name": "aggrelend",
  "instructions": [],
  "accounts": [
    {
      "name": "PoolVault",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "vault", "type": "publicKey"},
          {"name": "tokenMint", "type": "publicKey"},
          {"name": "depositTokens", "type": "u64"},
          {"name": "scaledShares", "type": "u128"},
          {"name": "lastAccruedTime", "type": "i64"},
          {"name": "cumulativeYieldIndex", "type": "u128"},
          {"name": "hasMarket", "type": {"array": ["bool", 45]}},
          {"name": "rewards", "type": "u64"},
          {"name": "boost", "type": "bool"},
          {"name": "bump", "type": "u8"}
        ]
      }
    }
  ],
  "events": [],
  "errors": [],
  "types": []
};

const PROGRAM_ID = 'AGGREbma2Gi9unS1mPptAcG4HmkMTLNmqcunYaSSf46b'

const tvl = async (api) => {
  const provider = getProvider()
  const program = new Program(idl, PROGRAM_ID, provider)

  const vaults = await program.account.poolVault.all()

  for (const { account: pool } of vaults)
    api.add(pool.tokenMint.toBase58(), pool.depositTokens.toString())
}

module.exports = {
  methodology: 'Sum of all assets deposited into the AggreLend protocol for yield aggregation.',
  doublecounted: true,
  timetravel: false,
  solana: { tvl },
}
