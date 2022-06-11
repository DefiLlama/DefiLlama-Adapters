const { sumSingleBalance, TOKEN_LIST, getBalance, } = require('../helper/terra')

async function tvl(timestamp, ethBlock, { terra: block }) {
	const balances = {}
	const aUSTBalance = await getBalance(TOKEN_LIST.anchorust, 'terra1aug2pyftq4e85kq5590ud30yswnewa42n9fmr8', block)
	sumSingleBalance(balances, TOKEN_LIST.anchorust, aUSTBalance)

	return balances
}

module.exports = {
  terra: {
    tvl
  }
}