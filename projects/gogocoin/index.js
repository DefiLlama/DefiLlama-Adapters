const sdk = require('@defillama/sdk');
const {
	transformPolygonAddress
} = require('../helper/portedTokens');
const {
	sumTokensAndLPs
} = require('../helper/unwrapLPs');

const ORION_SINGLE_STAKING_CONTRACT = '0x7FCf0f2dcEc385FCCEd98240A8A4bEC8e91da7D1'
const GOVERNANCE_STORAGE_CONTRACT = '0xd46206003FfB72Fe5FEB04373328C62e2bF864f9'
const LP_TOKEN_USDC = '0xe33Dd0C0534189b66B9872425189399e2B9c169D'
const STAKING_LP_CONTRACT = '0x5dc4ffc0f9c2261dcaae7f69e1a8837afbd577bc'
const GOGOCOIN = '0xdD2AF2E723547088D3846841fbDcC6A8093313d6'
const USDC = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'

/**
 * Gets the Total TVL of the GOGOcoin project
 * 
 * @param {number} timestamp 
 * @param {number} block 
 * @returns {any}
 */
async function tvl(timestamp, block) {
	const balances = {}
	const transform = await transformPolygonAddress();

	const [totalGOGOLocked, USDCPool] = await Promise.all([sdk.api.abi.call({
		target: GOVERNANCE_STORAGE_CONTRACT,
		abi: {
			"inputs": [],
			"name": "getTotalLockedGogo",
			"outputs": [{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}],
			"stateMutability": "view",
			"type": "function"
		},
		chain: 'polygon',
		block
	}), sdk.api.abi.call({
		target: ORION_SINGLE_STAKING_CONTRACT,
		abi: {
			"inputs": [],
			"name": "totalSupply",
			"outputs": [{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}],
			"stateMutability": "view",
			"type": "function"
		},
		chain: 'polygon',
		block
	})])

	sdk.util.sumSingleBalance(balances, transform(GOGOCOIN), totalGOGOLocked.output)
	sdk.util.sumSingleBalance(balances, transform(USDC), USDCPool.output)
	await sumTokensAndLPs(balances, [
		[LP_TOKEN_USDC, STAKING_LP_CONTRACT, true],
	], block, 'polygon', transform)

	return balances
};

module.exports = {
	name: 'GOGOcoin',
	timeTravel: true,
	website: 'https://app.gogocoin.io',
	token: 'GOGO',
	start: 1638388550,
	polygon: {
		tvl,
	},
	methodology: "We count liquidity that it is in our USDC-GOGO Liquidity Pool, we also count the total locked USDC in our USDC Staking contract and we count the numbers of GOGOs staked in our GOGO Staking contract.",
}