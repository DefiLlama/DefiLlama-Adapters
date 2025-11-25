const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const fundStore_monad = "0x576d51fB872065DC4Af6f83902fd4078eBCc2f03"; // fundStore_monad
const PINGU_monad = "0xA2426cD97583939E79Cfc12aC6E9121e37D0904d"; // PINGU_monad
const USDC_monad = "0x754704Bc059F8C67012fEd69BC8A327a5aafb603"; // USDC_monad
const assets_MONAD = [nullAddress, USDC_monad] // MON, USDC

module.exports = {
	start: '2025-11-24',
	monad: {
		start: '2025-11-24',
		tvl: sumTokensExport({ owners: [fundStore_monad], tokens: assets_MONAD }),
		staking: sumTokensExport({ owners: [fundStore_monad], tokens: [PINGU_monad] }),
	},
}
