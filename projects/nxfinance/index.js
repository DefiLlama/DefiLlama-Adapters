const { Program } = require("@project-serum/anchor");
const { getProvider, } = require("../helper/solana");
const nxIdl = require("./nx-idl.json");

const NX_PROGRAM_ADDR = "JMpxnop5u1HJAqjzpZHo7MmvfBQf5YkFw4nGK9F83x3";

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
