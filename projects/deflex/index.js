const {searchAccountsAll} = require('../helper/chain/algorand')
const sdk = require('@defillama/sdk')
const {transformBalances} = require("../helper/portedTokens");

async function tvl() {
	const balances = {}
	let escrowAccounts = await searchAccountsAll({appId: 949209670, limit: 1000})
	const assetInIdKey = Buffer.from((new TextEncoder()).encode('asset_in_id')).toString('base64')
	const amountInKey = Buffer.from((new TextEncoder()).encode('amount_in')).toString('base64')
	escrowAccounts.forEach((account) => {
		const localStates = account['apps-local-state']
		localStates.forEach((localState) => {
			if (!('key-value' in localState)) {
				return
			}
			let limitOrderState = {}
			for (let j = 0; j < localState['key-value'].length; j++) {
				const keyValue = localState['key-value'][j]
				limitOrderState[keyValue['key']] = keyValue['value']
			}
			const assetInId = limitOrderState[assetInIdKey]['uint']
			sdk.util.sumSingleBalance(balances, assetInId > 0 ? assetInId : 1, limitOrderState[amountInKey]['uint'])
		})
	})
	return transformBalances('algorand', balances)
}

module.exports = {
	timetravel: false,
	algorand: {
		tvl,
	}
}