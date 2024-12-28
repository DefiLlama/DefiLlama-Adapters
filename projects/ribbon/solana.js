const { getProvider, sumTokens2, } = require('../helper/solana')
const { Program, } = require("@project-serum/anchor");

async function tvl(api) {
  const provider = getProvider()
  const program = new Program(idl, 'RBN2XNc6JQU6ewFp9TyPq6WznsvNuumzSJkor1nJFcz', provider)
  const vaults = await program.account.vault.all()
  const tokenAccounts = vaults.map(({ account: {
    underlyingMint,
    startEpochVaultBalance,
    vaultUnderlyingTokenAccount,
    vaultDepositQueueUnderlyingTokenAccount,
    vaultWithdrawQueueRedeemableTokenAccount,
  } }) => {
    api.add(underlyingMint.toString(), +startEpochVaultBalance)
    return [vaultUnderlyingTokenAccount, vaultDepositQueueUnderlyingTokenAccount, vaultWithdrawQueueRedeemableTokenAccount]
  }).flat().map(i => i.toString())
  return sumTokens2({ balances: api.getBalances(), tokenAccounts, })
}
module.exports = {
  solana: {
    tvl,
  },
};

const idl = {
  "version": "0.1.0",
  "name": "covered_call_vault",
  "instructions": [],
  "accounts": [
    {
      "name": "Vault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vaultName",
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          },
          {
            "name": "vaultNonce",
            "type": "u8"
          },
          {
            "name": "redeemableMintNonce",
            "type": "u8"
          },
          {
            "name": "vaultUnderlyingTokenAccountNonce",
            "type": "u8"
          },
          {
            "name": "depositQueueHeaderNonce",
            "type": "u8"
          },
          {
            "name": "vaultDepositQueueUnderlyingTokenAccountNonce",
            "type": "u8"
          },
          {
            "name": "withdrawQueueHeaderNonce",
            "type": "u8"
          },
          {
            "name": "vaultWithdrawQueueRedeemableTokenAccountNonce",
            "type": "u8"
          },
          {
            "name": "underlyingMint",
            "type": "publicKey"
          },
          {
            "name": "redeemableMint",
            "type": "publicKey"
          },
          {
            "name": "vaultUnderlyingTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "vaultDepositQueueUnderlyingTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "vaultWithdrawQueueRedeemableTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "depositLimit",
            "type": "u64"
          },
          {
            "name": "epochSequenceNumber",
            "type": "u64"
          },
          {
            "name": "startEpoch",
            "type": "u64"
          },
          {
            "name": "endDeposits",
            "type": "u64"
          },
          {
            "name": "startSettlement",
            "type": "u64"
          },
          {
            "name": "endEpoch",
            "type": "u64"
          },
          {
            "name": "epochCadence",
            "type": "u32"
          },
          {
            "name": "startEpochVaultBalance",
            "type": "u64"
          },
          {
            "name": "optionMint",
            "type": "publicKey"
          },
          {
            "name": "optionsRemaining",
            "type": "bool"
          },
          {
            "name": "collateralCollected",
            "type": "bool"
          },
          {
            "name": "depositQueueHeader",
            "type": "publicKey"
          },
          {
            "name": "withdrawQueueHeader",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [],
  "events": [],
  "errors": []
}