const { getProvider, sumTokens2, } = require('./helper/solana')
const { Program, } = require("@project-serum/anchor");

async function tvl() {
  const provider = getProvider()
  const programId = 'D3BBjqUdCYuP18fNvvMbPAZ8DpcRi4io2EsYHQawJDag'
  const program = new Program(idl, programId, provider)
  const data = await program.account.pool.all()
  return sumTokens2({ tokenAccounts: data.map(i => i.account.treasuries).flat(), allowError: true, })
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}

const idl = {
  "version": "0.1.0",
  "name": "balancer_amm",
  "instructions": [],
  "accounts": [
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "fee",
            "type": "u64"
          },
          {
            "name": "taxFee",
            "type": "u64"
          },
          {
            "name": "state",
            "type": {
              "defined": "PoolState"
            }
          },
          {
            "name": "mintLpt",
            "type": "publicKey"
          },
          {
            "name": "taxMan",
            "type": "publicKey"
          },
          {
            "name": "mints",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "actions",
            "type": {
              "vec": {
                "defined": "MintActionState"
              }
            }
          },
          {
            "name": "treasuries",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "reserves",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "weights",
            "type": {
              "vec": "u64"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PoolState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Uninitialized"
          },
          {
            "name": "Initialized"
          },
          {
            "name": "Frozen"
          },
          {
            "name": "Deleted"
          },
          {
            "name": 'Initializing'
          }
        ]
      }
    },
    {
      "name": "MintActionState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Active"
          },
          {
            "name": "BidOnly"
          },
          {
            "name": "AskOnly"
          },
          {
            "name": "Paused"
          }
        ]
      }
    }
  ],
  "events": [],
  "errors": []
}
