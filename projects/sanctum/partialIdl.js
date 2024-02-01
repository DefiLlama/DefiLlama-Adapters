module.exports = {
  accounts: [
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeAuthority",
            "docs": [
              "The authority authorized to set fees"
            ],
            "type": "publicKey"
          },
          {
            "name": "lpMint",
            "docs": [
              "The pool's lp token mint"
            ],
            "type": "publicKey"
          },
          {
            "name": "incomingStake",
            "docs": [
              "The last known value of total number of lamports in stake accounts",
              "owned by the pool that have not been reclaimed yet.",
              "The total SOL owned by a pool accounted for can be calculated by taking",
              "incoming_stake + pool_sol_reserves.lamports"
            ],
            "type": "u64"
          }
        ]
      }
    },
  ],
  instructions: [],
}
