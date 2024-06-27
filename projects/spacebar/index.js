const ADDRESSES = require('../helper/coreAssets.json')
const { request, } = require("graphql-request")
const { getLogs } = require('../helper/cache/getLogs')

const graphUrl =
	"https://api.studio.thegraph.com/query/67212/spacebar/version/latest"

const tvlQuery = `
	{
		totalValueLocked(id: "TVL") {
			amount
		}
	}
`

// async function tvl() {
// 	const response = await request(graphUrl, tvlQuery)
// 	const tvlAmount = response.totalValueLocked.amount
// 	return {
// 		["blast:" + ADDRESSES.null]:
// 			tvlAmount.toString(),
// 	}
// }

async function tvl(api) {
	const registry = '0xE1784da2b8F42C31Fb729E870A4A8064703555c2'
	const fromBlock = 203239
	const unStakeLogs = await getLogs({ api, target: registry, eventAbi: 'event Unstake(address indexed service, address indexed user, address indexed to, uint256 amount)', onlyArgs: true, fromBlock, extraKey: 'unstake',})
	const stakeLogs = await getLogs({ api, target: registry, eventAbi: 'event Stake(address indexed service, address indexed user, uint256 amount)', onlyArgs: true, fromBlock, extraKey: 'stake',})
	stakeLogs.forEach(log => api.addGasToken(log.amount))
	unStakeLogs.forEach(log => api.addGasToken(Number(log.amount) * -1))
}

module.exports = {
	blast: {
		tvl,
	},
}
