const utils = require('../helper/utils');
let _response


function fetchChain() {
    return async () => {
        if (!_response) _response = utils.fetchURL('https://api.blacksail.finance/stats')
        const response = await _response;

        let total_tvl = 0;
        let vaults = response["data"]["yield"]

        for (const vault in vaults) {
            total_tvl += parseFloat(vaults[vault]["total_usd_staked_in_vault"])
        }
        return total_tvl
    }
}

module.exports = {
    sonic: {
        tvl: fetchChain()
    }
}