const { Program } = require("@project-serum/anchor");
const { getProvider, getTokenSupply, sumTokens } = require("../helper/solana");
const jupiterIdl = require("./jupiter-idl.json");
const nxIdl = require("./nx-idl.json");

const NX_PROGRAM_ADDR = "JMpxnop5u1HJAqjzpZHo7MmvfBQf5YkFw4nGK9F83x3";
const NX_POOLS_ADDR = [
	"4dhSc8qCYViN1QSXi2kzJFHQbkThnHaqMMjK1XeGou6y", // USDC
	"J9QYxRAtPTrSBEmKhVt8xQfuLo5kFcdxKi3ymsU61p4D", // JLP
];

async function tvl(api) {
	const provider = getProvider();
	const nx_program = new Program(nxIdl, NX_PROGRAM_ADDR, provider);

	const res = await Promise.all(
		NX_POOLS_ADDR.map(addr => nx_program.account.marginPool.fetch(addr))
	);

	for (let pool of res) 
		api.add(pool.tokenMint.toBase58(), pool.depositTokens.toString())

	return api.getBalances();
}

module.exports = {
  methodology: "Sum of assets deposited for lending and assets deposited as collateral for leveraging",
  timetravel: false,
  solana: { tvl, },
};
