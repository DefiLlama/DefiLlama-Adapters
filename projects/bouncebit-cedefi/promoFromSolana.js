const { getProvider, } = require('../helper/solana')
const { Program } = require("@project-serum/anchor");

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
						"name": "is_stake_enable",
						"type": "bool"
					},
					{
						"name": "is_withdraw_enable",
						"type": "bool"
					},
					{
						"name": "max_stake_amount",
						"type": "u64"
					},
					{
						"name": "lock_period",
						"type": "i64"
					},
					{
						"name": "full_stake_timestamp",
						"type": "i64"
					},
					{
						"name": "token_mint",
						"type": "publicKey"
					},
					{
						"name": "token_escrow",
						"type": "publicKey"
					},
					{
						"name": "stat",
						"type": {
							"defined": "VaultStat"
						}
					}
				]
			}
		},
	],
	"types": [
		{
			"name": "VaultStat",
			"type": {
				"kind": "struct",
				"fields": [
					{
						"name": "total_staked",
						"type": "u64"
					},
					{
						"name": "total_rewards",
						"type": "u64"
					}
				]
			}
		},
	]
}

async function tvl(api) {
  const provider = getProvider()
  const programId = '5HRzz8VDD9QjpEBBdq6hBUEXcssxW5mPnod4L6Qgnh9g'
  const program = new Program(minimalIdl, programId, provider)
  
  const vaults = await program.account.vault.all()

	vaults.map(vault=> {
		const { stat } = vault.account
		const totalStaked = BigInt(stat.totalStaked.toString())
		// const totalRewards = BigInt(stat.totalRewards.toString())
		const tvlAmount = totalStaked

		if (tvlAmount > 0) {
			api.add(vault.account.tokenMint.toBase58(), tvlAmount.toString())
		}

	})

  return api.getBalances()
}


module.exports = {
  solana: { tvl }
} 