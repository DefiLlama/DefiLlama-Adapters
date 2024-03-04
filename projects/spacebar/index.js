const { request, gql } = require("graphql-request")

const graphUrl =
	"https://api.studio.thegraph.com/query/67212/spacebar/version/latest"

const tvlQuery = gql`
	{
		totalValueLocked(id: "TVL") {
			amount
		}
	}
`

async function tvl() {
	try {
		const response = await request(graphUrl, tvlQuery)
		const tvlAmount = response.totalValueLocked.amount
		return {
			"blast:0x0000000000000000000000000000000000000000":
				tvlAmount.toString(),
		}
	} catch (error) {
		console.error("Error fetching TVL:", error)
		return 0
	}
}

module.exports = {
	blast: {
		tvl,
	},
}
