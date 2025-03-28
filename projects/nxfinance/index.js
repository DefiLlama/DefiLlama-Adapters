const { Program } = require("@project-serum/anchor");
const ADDRESSES = require('../helper/coreAssets.json')

const { getProvider } = require("../helper/solana");
const { drift: { vaultTvl } } = require("../helper/chain/rpcProxy")


const nxIdlV1 = require("./nx-idl-v1.json");
const nxIdlV2 = require("./nx-idl-v2.json");

const NX_PROGRAM_ADDR_V1 = "EHBN9YKtMmrZhj8JZqyBQRGqyyeHw5xUB1Q5eAHszuMt";
const NX_PROGRAM_ADDR_V2 = "NXFiKimQN3QSL3CDhCXddyVmLfrai8HK36bHKaAzK7g";
const NX_JLP_DELTA_NEUTRAL_VAULT_ADDR = "HYHnL9BB3tqSPxkVbdcAn9CAa4hyqNYUh1FwDc4he7aD";
const FUNDING_RATE_REVERSION_VAULT_ADDR = "Cxs13cpUSd3ZQwGs6u8ov9uLH46x6gveyjspe4LtaSzt";


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

	const drift_jlp_vault_tvl = await vaultTvl(NX_JLP_DELTA_NEUTRAL_VAULT_ADDR)
	api.add(ADDRESSES.solana.USDC, drift_jlp_vault_tvl.toString())

	const funding_rate_reversion_tvl = await vaultTvl(FUNDING_RATE_REVERSION_VAULT_ADDR)
	api.add(ADDRESSES.solana.USDC, funding_rate_reversion_tvl.toString())


}

module.exports = {
	methodology: "Sum of assets deposited for lending and assets deposited as collateral for leveraging",
	timetravel: false,
	solana: { tvl, },
};
