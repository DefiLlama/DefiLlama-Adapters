const { Program } = require("@project-serum/anchor");
const { getProvider, } = require("../helper/solana");
const nxIdl = require("./nx-idl.json");

const NX_PROGRAM_ADDR = "EHBN9YKtMmrZhj8JZqyBQRGqyyeHw5xUB1Q5eAHszuMt";

async function tvl(api) {
	const provider = getProvider();
	const nx_program = new Program(nxIdl, NX_PROGRAM_ADDR, provider);
	const accounts = await nx_program.account.marginPool.all()

	for (let { account: pool } of accounts)
		api.add(pool.tokenMint.toBase58(), pool.depositTokens.toString())
}

module.exports = {
	methodology: "Sum of assets deposited for lending and assets deposited as collateral for leveraging",
	timetravel: false,
	solana: { tvl, },
};
