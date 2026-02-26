const { sumTokens2 } = require('../helper/unwrapLPs');
const { getLogs } = require('../helper/cache/getLogs');

const MASTER_CONTRACT = '0x1eb90323ae74e5fbc3241c1d074cfd0b117d7e8e';
const FUNDER_EOA_1 = '0x5D45B7d8e517eF6b7085175ed395D9c8562b952f';

// Standard tokens to always check in Funders (e.g., USDC, WETH)
const STATIC_TOKENS = [
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
    '0x4200000000000000000000000000000000000006', // WETH
    '0xC139C86de76DF41c041A30853C3958427fA7CEbD', // MATE (base)
];

async function tvl(api) {
    // 1. Fetch logs for "MarketCreated"
    // Corresponds to ABI: event MarketCreated(address indexed creator, uint256 id, address market)
    const logs = await getLogs({
        api,
        target: MASTER_CONTRACT,
        eventAbi: 'event MarketCreated(address indexed creator, uint256 id, address market)',
        onlyArgs: true,
        fromBlock: 25593661, // https://basescan.org/tx/0x8bc3bc9ab2ba684cd2307beeb68e2509d6e447290b04f891784a9b74a56ca29e
    });

    // 2. Extract Market IDs to query the Master contract for their tokens
    const marketIds = logs.map(log => log.id);

    // 3. MultiCall to 'marketCollateralInfo' to get the token for each market
    // Corresponds to ABI: function marketCollateralInfo(uint256 marketId) view returns (address collateral, ...)
    const collateralInfo = await api.multiCall({
        abi: 'function marketCollateralInfo(uint256 marketId) view returns (address collateral, string name, string symbol, uint8 decimals)',
        calls: marketIds.map(id => ({
            target: MASTER_CONTRACT,
            params: [id]
        }))
    });

    // 4. Map the results to create pairs: [TokenAddress, MarketAddress]
    const marketTokenPairs = [];
    const allDiscoveredTokens = new Set();

    logs.forEach((log, index) => {
        const marketAddress = log.market;
        const tokenAddress = collateralInfo[index].collateral;

        if (tokenAddress && marketAddress) {
            marketTokenPairs.push([tokenAddress, marketAddress]);
            allDiscoveredTokens.add(tokenAddress);
        }
    });

    // 5. Add Market TVL (Dynamic tokens in Dynamic Markets)
    await sumTokens2({
        api,
        tokensAndOwners: marketTokenPairs,
    });

    // 6. Add Funder EOA TVL
    // We check the static list PLUS any new tokens we discovered in the markets
    const funderTokens = [...new Set([...STATIC_TOKENS, ...Array.from(allDiscoveredTokens)])];

    return sumTokens2({
        api,
        owners: [FUNDER_EOA_1],
        tokens: funderTokens,
    });
}

module.exports = {
    methodology: "Counts TVL by fetching all created markets from the Master contract logs, querying the collateral token for each market, and summing the balances. It also tracks these discovered tokens within the Precog Funder EOAs.",
    base: {
        tvl
    }
};