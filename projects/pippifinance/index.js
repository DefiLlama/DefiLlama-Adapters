const sdk = require("@defillama/sdk");
const { uniTvlExport } = require('../helper/calculateUniTvl.js')

const PIPPI_FACTORY = "0x979efE7cA072b72d6388f415d042951dDF13036e";

module.exports = {
	heco: {
		tvl: uniTvlExport(PIPPI_FACTORY, "heco")
	},
};