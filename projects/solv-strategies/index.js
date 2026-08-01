const { default: BigNumber } = require("bignumber.js");
const { getConfig } = require("../helper/cache");

const addressUrl = 'https://raw.githubusercontent.com/solv-finance/solv-protocol-defillama/refs/heads/main/solv-strategies.json';

async function tvl(api) {
    const address = (await getConfig('solv-protocol/strategies', addressUrl));

    if (!address[api.chain]) return

    const strategies = address[api.chain]["strategies"];
    const solvbtcAddress = address[api.chain]["solvbtc"];

    const balances = await Promise.all(strategies.map(async (strategy) => {
        const [totalSupply, nav] = await Promise.all([
            api.call({
                abi: 'uint256:totalSupply',
                target: strategy.erc20,
            }),
            api.call({
                abi: 'function getSubscribeNav(bytes32 poolId_, uint256 time_) view returns (uint256 nav_, uint256 navTime_)',
                target: strategy.navOracle,
                params: [strategy.poolId, api.timestamp],
            }),
        ]);

        const balance = BigNumber(totalSupply)
            .times(BigNumber(nav.nav_).div(1e18))
            .toNumber();
        return [solvbtcAddress, balance];
    }));

    for (const item of balances) {
        if (item) {
            const [token, amount] = item;
            api.add(token, amount);
        }
    }

    return api.getBalances()
}

['bsc', 'ethereum', 'avax', 'bob', 'berachain'].forEach(chain => {
    module.exports[chain] = {
        tvl
    }
})