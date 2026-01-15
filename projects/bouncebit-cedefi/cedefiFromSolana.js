const ADDRESSES = require('../helper/coreAssets.json')
const { getProvider, } = require('../helper/solana')
const { Program, BN } = require("@project-serum/anchor");
const { PublicKey } = require('@solana/web3.js');

const V3minimalIdl = {
	"instructions": [],
	"accounts": [{
		"name": "TokenConfig",
		"type": {
			"kind": "struct",
			"fields": [
				{
					"name": "tokenMint",
					"type": "publicKey"
				},
				{
					"name": "supported",
					"type": "bool"
				},
				{
					"name": "decimals",
					"type": "u8"
				},
				{
					"name": "minSubscribeAmount",
					"type": "u64"
				},
				{
					"name": "isNative",
					"type": "bool"
				},
				{
					"name": "totalLocked",
					"type": "u64"
				},
				{
					"name": "totalRedeemed",
					"type": "u64"
				},
				{
					"name": "totalClaimed",
					"type": "u64"
				}
			]
		}
	}]
}

async function tvlV3(api) {
  const provider = getProvider()
  const programId = 'BFVxnJoyUW1xPmaYgsn8NF4GdqPB91Mqqgr7RKaa6YWS'

  const program = new Program(V3minimalIdl, programId, provider)

  const vaults = await program.account.tokenConfig.all()

  for (const vault of vaults) {
    const { tokenMint, supported, totalLocked, totalRedeemed } = vault.account

    if (supported) {
      const tvlAmount = totalLocked - totalRedeemed

      api.add(tokenMint.toBase58(), tvlAmount)
    }
  }

  return api.getBalances()
}

const tokenMints = [
  ADDRESSES.solana.SOL,
  ADDRESSES.solana.USDC,
  ADDRESSES.solana.USDT,
]

const minimalIdl = {
	"instructions": [],
	"accounts": [
		{
			"name": "Vault",
			"type": {
				"kind": "struct",
				"fields": [
					{
						"name": "is_vault_enable",
						"type": "bool"
					},
					{
						"name": "is_open_enable",
						"type": "bool"
					},
					{
						"name": "is_normal_close_enable",
						"type": "bool"
					},
					{
						"name": "is_fast_close_enable",
						"type": "bool"
					},
					{
						"name": "is_claim_enable",
						"type": "bool"
					},
					{
						"name": "open_cooldown_days",
						"type": "u16"
					},
					{
						"name": "open_date_offset",
						"type": "u16"
					},
					{
						"name": "clearing_date_no",
						"type": "u16"
					},
					{
						"name": "min_amount",
						"type": "u64"
					},
					{
						"name": "stat",
						"type": {
							"defined": "VaultStat"
						}
					}
				]
			}
		}
	],
	"types": [
		{
			"name": "VaultStat",
			"type": {
				"kind": "struct",
				"fields": [
					{
						"name": "total_open",
						"type": "u128"
					},
					{
						"name": "total_normal_principal_close",
						"type": "u128"
					},
					{
						"name": "total_normal_shares_close",
						"type": "u128"
					},
					{
						"name": "total_normal_rewards_close",
						"type": "u128"
					},
					{
						"name": "total_fast_close",
						"type": "u128"
					},
					{
						"name": "total_fast_fee",
						"type": "u128"
					},
					{
						"name": "total_claim_assets",
						"type": "u128"
					},
					{
						"name": "total_claim_fee",
						"type": "u128"
					}
				]
			}
		}
	]
}

async function tvlV2(api) {
  const provider = getProvider()
  const programId = '65YBWQitcBexwuaBKfAV163xDd4LzVAdytATLbttpgxx'
  const strategyIds = [1]

  const program = new Program(minimalIdl, programId, provider)

  const vaults = await program.account.vault.all()

  for (const tokenMint of tokenMints) {
    for (const strategyId of strategyIds) {
      const [expectedVaultAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('vault'),
          new PublicKey(tokenMint).toBuffer(),
          new BN(strategyId).toArrayLike(Buffer, 'le', 2)
        ],
        new PublicKey(programId)
      )

      const vault = vaults.find(v => v.publicKey.toBase58() === expectedVaultAddress.toBase58())

      if (vault) {
        const { stat } = vault.account
        const totalOpen = BigInt(stat.totalOpen.toString())
        const totalNormalClose = BigInt(stat.totalNormalPrincipalClose.toString())
        const totalFastClose = BigInt(stat.totalFastClose.toString())
        const tvlAmount = totalOpen - totalNormalClose - totalFastClose

        if (tvlAmount > 0) {
          api.add(tokenMint, tvlAmount.toString())
        }
      }
    }
  }

  return api.getBalances()
}

async function tvl(api) {
	tvlV2(api)
	tvlV3(api)
  return api.getBalances()
}

module.exports = {
  solana: { tvl }
} 