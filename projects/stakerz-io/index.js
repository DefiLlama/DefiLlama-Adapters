const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');
let _response

function fetchChain(chainId, staking) {
    return async () => {
        if (!_response) _response = utils.fetchURL('https://api.stakerz.io/tvl')
        const response = await _response;

        let tvl = 0;
        const chain = response.data[chainId];
        for (const vault in chain) {
            const isSTAKERZ = vault.includes("stakerz")
            if ((isSTAKERZ && staking) || (!isSTAKERZ && !staking)) {
                tvl += Number(chain[vault]);
            }
        }

        return toUSDTBalances(tvl);
    }
}

const chains = {
    kava: 2222
}

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    doublecounted: true,
    ...Object.fromEntries(Object.entries(chains).map(chain => [chain[0], {
        tvl: fetchChain(chain[1], false),
        staking: fetchChain(chain[1], true),
    }]))
}
