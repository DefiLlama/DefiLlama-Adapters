const { getProvider } = require('../helper/solana')
const { Program, } = require("@project-serum/anchor");
const nxIdlV1 = {
  "version": "0.1.0",
  "name": "leverage_finance",
  "instructions": [],
  "accounts": [
    {
      "name": "MarginPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "leveragefi",
            "type": "publicKey"
          },
          {
            "name": "vault",
            "type": "publicKey"
          },
          {
            "name": "feeDestination",
            "type": "publicKey"
          },
          {
            "name": "poolAuthority",
            "type": "publicKey"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "tokenPriceOracle",
            "type": "publicKey"
          },
          {
            "name": "borrowedTokens",
            "type": "u64"
          },
          {
            "name": "depositTokens",
            "type": "u64"
          },
          {
            "name": "depositNotes",
            "type": "u64"
          },
          {
            "name": "loanNotes",
            "type": "u64"
          },
          {
            "name": "depositInterest",
            "type": "u64"
          },
          {
            "name": "loanInterest",
            "type": "u64"
          },
          {
            "name": "protocolFee",
            "type": "u64"
          },
          {
            "name": "accruedUntil",
            "type": "i64"
          },
          {
            "name": "utilizationFlag",
            "type": "u16"
          }
        ]
      }
    }
  ]
};
const nxIdlV2 = require('./nx-idl-v2.json');

const NX_PROGRAM_ADDR_V1 = "EHBN9YKtMmrZhj8JZqyBQRGqyyeHw5xUB1Q5eAHszuMt";
const NX_PROGRAM_ADDR_V2 = "NXFiKimQN3QSL3CDhCXddyVmLfrai8HK36bHKaAzK7g";

const tvl = async (api) => {
	const provider = getProvider()
	const nx_program_v1 = new Program(nxIdlV1, NX_PROGRAM_ADDR_V1, provider)
	const nx_program_v2 = new Program(nxIdlV2, NX_PROGRAM_ADDR_V2, provider)

	const res = await Promise.all([
		nx_program_v1.account.marginPool.all(),
		nx_program_v2.account.collateralPool.all(),
		nx_program_v2.account.lendingPool.all()
	])

	for (let value of res)
		for (let { account: pool } of value) 
			api.add(pool.tokenMint.toBase58(), pool.depositTokens.toString())
}

module.exports = {
	methodology: "Sum of assets deposited for lending and assets deposited as collateral for leveraging",
	timetravel: false,
	solana: { tvl, },
};