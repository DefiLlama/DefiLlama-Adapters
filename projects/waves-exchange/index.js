const { get } = require('../helper/http')
const sdk = require('@defillama/sdk')

const endpoint = "https://waves.exchange/api/v1/liquidity_pools/stats"

async function tvl() {
	const balances = {}
	const data = (await get(endpoint)).items
	data.forEach(({ amount_asset_balance: bal0, price_asset_id: id1, price_asset_balance: bal1, amount_asset_id: id0}) => {
		if (mapping[id0]) sdk.util.sumSingleBalance(balances,id0,(10 ** mapping[id0]) * bal0, 'waves')
		if (mapping[id1]) sdk.util.sumSingleBalance(balances,id1,(10 ** mapping[id1]) * bal1, 'waves')
	})

	return balances
}

const mapping = {
  "5UYBPpq4WoU5n4MwpFkgJnW3Fq4B1u3ukpK33ik4QerR": "8",
  "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p": "6",
  "Atqv59EYzjFGuitKVnMRk6H8FukjoV3ktPorbEys25on": "8",
  "474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu": "8",
  "34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ": "6",
  "8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS": "8",
  "WAVES": "8",
  "2Fh9m3dNQXycHdnytEaETN3P1gDT7ij5U4HjMqQBeaqN": "8",
  "4GZH8rk5vDmMXJ81Xqfm3ovFaczqMnQ11r7aELiNxWBV": "8",
  "3KhNcHo4We1G5EWps7b1e5DTdLgWDzctc8S6ynu37KAb": "8",
  "GVxGPBtgVWMW1wHiFnfaCakbJ6sKgZgowJgW5Dqrd7JH": "2",
  "HcHacFH51pY91zjJa3ZiUVWBww54LnsL4EP3s7hVGo9L": "8",
  "4YmM7mj3Av4DPvpNpbtK4jHbpzYDcZuY6UUnYpqTbzLj": "8",
  "6QUVF8nVVVvM7do7JT2eJ5o5ehnZgXUg13ysiB9JiQrZ": "8",
  "7TMu26hAs7B2oW6c5sfx45KSZT7GQA3TZNYuCav8Dcqt": "8",
  "E4rss7qLUcawCvD2uMrbLeTMPGkX15kS3okWCbUhLNKL": "8",
  "HLckRcg7hJ3Syf3PrGftFijKqQMJipf81WY3fwvHCJbe": "8",
  "8zUYbdB8Q6mDhpcXYv52ji8ycfj4SDX4gJXS7YY3dA4R": "6",
  "8DLiYZjo3UUaRBTHU7Ayoqg4ihwb6YH1AfXrrhdjQ7K1": "6",
  "47cyc68FWJszCWEwMWVsD9CadjS2M1XtgANuRGbEW8UH": "8",
  "2bbGhKo5C31iEiB4CwGuqMYwjD7gCA9eXmm51fe2v8vT": "8",
  "BLRxWVJWaVuR2CsCoTvTw2bDZ3sQLeTbCofcJv7dP5J4": "8",
  "A1uMqYTzBdakuSNDv7CruWXP8mRZ4EkHwmip2RCauyZH": "8",
  "2thtesXvnVMcCnih9iZbJL3d2NQZMfzENJo8YFj6r5jU": "6",
  "2GBgdhqMjUPqreqPziXvZFSmDiQVrxNuGxR1z7ZVsm4Z": "8",
  "Aug9ccbPApb1hxXSue8fHuvbyMf1FV1BYBtLUuS5LZnU": "8",
  "ATQdLbehsMrmHZLNFhUm1r6s14NBT5JCFcSJGpaMrkAr": "8",
  "8YyrMfuBdZ5gtMWkynLTveRvGb6LJ4Aff9rpz46UUMW": "8",
  "EfwRV6MuUCGgAUchdsF4dDFnSpKrDW3UYshdaDy4VBeB": "8",
  "5zoDNRdwVXwe7DveruJGxuJnqo7SYhveDeKb8ggAuC34": "8",
  "DSbbhLsSTeDg5Lsiufk2Aneh3DjVqJuPr2M9uU1gwy5p": "8",
  "4LHHvYGNKJUg5hj65aGD5vgScvCBmLpdRFtjokvCjSL8": "8",
  "6nSpVyNH7yM69eg446wrQR94ipbbcmZMU1ENPwanC97g": "8",
  "Ehie5xYpeN8op1Cctc6aGUrqx8jq3jtf1DSjXDbfm7aT": "6",
  "7LMV3s1J4dKpMQZqge5sKYoFkZRLojnnU49aerqos4yg": "8",
  "9sQutD5HnRvjM1uui5cVC4w9xkMPAfYEV8ymug3Mon2Y": "8",
  "DHgwrRvVyqJsepd32YbBqUeDH4GJ1N984X8QoekjgH8J": "2",
  "HZk1mbfuJpmxU1Fs4AX5MWLVYtctsNcg6e2C6VKqK8zk": "8",
  "6XtHjpXbs9RRJP2Sr9GUyVqzACcby9TkThHXnjVC5CDJ": "6"
}

module.exports = {
	timetravel: false,
	waves: {
		tvl
	},
}