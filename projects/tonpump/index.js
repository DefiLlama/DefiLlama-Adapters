const ADDRESSES = require("../helper/coreAssets.json");
const { fetchURL } = require('../helper/utils');
const { sumTokensExport } = require("../helper/sumTokens");

async function fetchTvl(api) {
    const res = await fetchURL('https://tonfunstats-eqnd7.ondigitalocean.app/api/v1/getServiceTokens?service=hot')
    await sumTokensExport({ tokens: [ADDRESSES.ton.TON], owners: res.data })(api)
}

module.exports = {
    timetravel: false,
    ton: {
        tvl: fetchTvl
    }
}
