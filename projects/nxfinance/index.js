const { Program } = require("@project-serum/anchor");
const { getProvider, } = require("../helper/solana");
const nxIdlV1 = require("./nx-idl-v1.json");
const nxIdlV2 = require("./nx-idl-v2.json");

const NX_PROGRAM_ADDR_V1 = "EHBN9YKtMmrZhj8JZqyBQRGqyyeHw5xUB1Q5eAHszuMt";
const NX_PROGRAM_ADDR_V2 = "NXFiKimQN3QSL3CDhCXddyVmLfrai8HK36bHKaAzK7g";

async function tvl(api) {
	const provider = getProvider();

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
