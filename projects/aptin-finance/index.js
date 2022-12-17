const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const { getResources, } = require("../helper/chain/aptos");
const { transformBalances } = require("../helper/portedTokens");
const axios = require("axios");

let resourcesCache;

async function _getResources() {
    if (!resourcesCache) resourcesCache = getResources("0xabaf41ed192141b481434b99227f2b28c313681bc76714dc88e5b2e26b24b84c")
    return resourcesCache
}

module.exports = {
    timetravel: false,
    methodology:
        "TVL contains the sum of the supply of all markets in the Aptin protocol contract, borrowed tokens are not counted.",
    aptos: {
        tvl: async () => {

            const data = await _getResources()
            const lendPool = data.find((r) => r.type == "0xb7d960e5f0a58cc0817774e611d7e3ae54c6843816521f02d7ced583d6434896::pool::LendProtocol");
            const coins = lendPool.data.coins;
            const poolHandle = lendPool.data.pools.handle;

            // 
            let coinPools = [];
            for (let index = 0; index < coins.length; index++) {
                try {
                    var options = {
                        method: 'POST',
                        url: 'https://fullnode.mainnet.aptoslabs.com/v1/tables/' + poolHandle + '/item',
                        headers: { 'Content-Type': 'application/json' },
                        data: {
                            key_type: '0x1::string::String',
                            value_type: '0xb7d960e5f0a58cc0817774e611d7e3ae54c6843816521f02d7ced583d6434896::pool::Pool',
                            key: coins[index]
                        }
                    };

                    const response = await axios.request(options); 
                    coinPools.push(
                        {
                            token: coins[index],
                            supplyBalance: response.data.supply_pool.total_value
                        }
                    )
                } catch (error) {

                }
            }

            const balances = {};
            coinPools.forEach(({ token, supplyBalance }) => {
                sdk.util.sumSingleBalance(balances, token, supplyBalance);
            });
            const _getBalances = await transformBalances("aptos", balances);
            return _getBalances;
        },
        borrowed: async () => {
            const data = await _getResources()
            const lendPool = data.find((r) => r.type == "0xb7d960e5f0a58cc0817774e611d7e3ae54c6843816521f02d7ced583d6434896::pool::LendProtocol");
            const coins = lendPool.data.coins;
            const poolHandle = lendPool.data.pools.handle;
             
            // 
            let coinPools = [];
            for (let index = 0; index < coins.length; index++) {
                try {
                    var options = {
                        method: 'POST',
                        url: 'https://fullnode.mainnet.aptoslabs.com/v1/tables/' + poolHandle + '/item',
                        headers: { 'Content-Type': 'application/json' },
                        data: {
                            key_type: '0x1::string::String',
                            value_type: '0xb7d960e5f0a58cc0817774e611d7e3ae54c6843816521f02d7ced583d6434896::pool::Pool',
                            key: coins[index]
                        }
                    };

                    const response = await axios.request(options); 
                    coinPools.push(
                        {
                            token: coins[index], 
                            borrowBalance: response.data.borrow_pool.total_value
                        }
                    )
                } catch (error) {

                }
            } 

            const balances = {};
            coinPools.forEach(({ token, borrowBalance }) => {
                sdk.util.sumSingleBalance(balances, token, borrowBalance);
            }); 

            const _getBalances = await transformBalances("aptos", balances); 
            return _getBalances;
        },
    },
};
