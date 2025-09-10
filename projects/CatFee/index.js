const { nullAddress, sumTokensExport } = require("../helper/unwrapLPs");

	const addresses = [
		'TPJtvpmtvBTydEfCtdaT9XAH5oTTkFNPXX',
		'TKoffapJgw2E586kp9taJvjqdfpiKrWKWG',
		'TN9EhKWtH4jvtx9xr8fFaA3qfuopdpvjhf',
		'TYEMUMKBmkTRMa1CNh7xkNYZ2mTVFw9f1a',
		'TTWkCVPbRdjzLHcrYaMYecuqpQSHQ37hWZ',
		'TELWKqZ2oCU8KwdMafysD7hDrmaMMo9nRc',
		'TAA5NR8zCfzFpDJDeQ4316uE1LAQfiiQpK',
		'THVmdJwcuXi3So9U3v6an4dTkXmQdNQ9BB',
		'TB8XwKU6agKskNUqFK3mcNc8eu4VVd31WV'
	]

	module.exports = {
		tron: {
			tvl: sumTokensExport({owners: addresses, tokens: [nullAddress] }),
		},
		timetravel: false,
	};
