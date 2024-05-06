const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs")
const { sumTokensExport } = require("../helper/unknownTokens")
const VAULT = '0x3A93FCCcD2769579eFE03d6DeF2C4468F5F0bd38'
const FARM_PROXY = '0xca6aca5eabd9fac29404974e1a69a0b69c7f1ea2'

async function tvl(api) {
	return sumTokens2({
		api,
		ownerTokens: [
			[[
				ADDRESSES.arbitrum.USDT,
				'0xf6995955e4b0e5b287693c221f456951d612b628',
				'0xee338313f022caee84034253174fa562495dcc15',
				'0x8dc3312c68125a94916d62b97bb5d925f84d4ae0',
				'0xd3204e4189becd9cd957046a8e4a643437ee0acc',
				'0xf52f079af080c9fb5afca57dde0f8b83d49692a9',
			], VAULT],
			[[ADDRESSES.arbitrum.ARB], FARM_PROXY]
		]
	})
}

module.exports = {
	methodology: 'Sums the total value locked of all strategies in Atlas',
	hallmarks: [
		[1681776000, "Rug Pull"]
	],
	arbitrum: {
		tvl,
		pool2: sumTokensExport({ useDefaultCoreAssets: true, owner: FARM_PROXY, tokens: ['0x4edaa03fc13f8f13c3290c3728f587760b12e381'], lps: ['0x4edaa03fc13f8f13c3290c3728f587760b12e381'] }),
		staking: sumTokensExport({ useDefaultCoreAssets: true, owner: FARM_PROXY, tokens: ['0x296A0b8847BD4ED9af71a9ef238fa5Be0778B611'], lps: ['0x4edaa03fc13f8f13c3290c3728f587760b12e381'] }),
	}
}
