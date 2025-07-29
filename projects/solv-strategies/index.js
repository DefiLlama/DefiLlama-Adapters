const { default: BigNumber } = require("bignumber.js");
const { getConfig } = require("../helper/cache");
const { getLogs } = require('../helper/cache/getLogs')

const addressUrl = 'https://raw.githubusercontent.com/solv-finance/solv-protocol-defillama/refs/heads/main/solv-strategies.json';

async function tvl(api) {
    const address = (await getConfig('solv-protocol/strategies', addressUrl));

    if (!address[api.chain]) return

    const strategies = address[api.chain]["strategies"];
    const solvbtcAddress = address[api.chain]["solvbtc"];
    const routerV2 = address[api.chain]["routerV2"]

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

        let adjustedTotalSupply = totalSupply;
        if (routerV2) {
            const balance = await routerEvents(api, routerV2);
            adjustedTotalSupply = BigNumber(totalSupply).minus(BigNumber(balance)).toString();
        }

        const balance = BigNumber(adjustedTotalSupply)
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


async function routerEvents(api, routerV2) {
    if (!routerV2["contractAddress"] && !routerV2["currency"] && !routerV2["requester"]) {
        return;
    }
    let { contractAddress, fromBlock, currency, requester } = routerV2;

    const toBlock = api.block;

    const [depositLogs, withdrawLogs, cancelWithdrawLogs] = await Promise.all([
        getLogs({
            api,
            target: contractAddress,
            topic: '0x6937da7733b7e101e4ab6e3a3ec12fe857d7a7ca921348ef12feff7abfcee01a',
            eventAbi: 'event Deposit(address indexed targetToken, address indexed currency, address indexed depositor, uint256 targetTokenAmount, uint256 currencyAmount, address[] path, bytes32[] poolIds)',
            onlyArgs: true,
            onlyUseExistingCache: true,
            fromBlock,
            toBlock,
        }),
        getLogs({
            api,
            target: contractAddress,
            topic: '0x50aa488fffd286866bc78078718365f7c3880cf5f95179a61e37cf84c5fd76c5',
            eventAbi: 'event WithdrawRequest (address indexed targetToken, address indexed currency, address indexed requester, bytes32 poolId, uint256 redemptionId)',
            onlyArgs: true,
            onlyUseExistingCache: true,
            fromBlock,
            toBlock,
        }),
        getLogs({
            api,
            target: contractAddress,
            topic: '0xbcab14a9990bc1fc30373acf248d280252f63653e6ccdcbd1f7929552a84c738',
            eventAbi: 'event CancelWithdrawRequest (address indexed targetToken, address indexed redemption, address indexed requester, bytes32 poolId, uint256 redemptionId, uint256 targetTokenAmount)',
            onlyArgs: true,
            onlyUseExistingCache: true,
            fromBlock,
            toBlock,
        })
    ]);

    const filteredDepositLogs = depositLogs.filter(log => {
        const currencyMatch = log.currency?.toLowerCase() === currency.toLowerCase();
        const depositorMatch = log.depositor?.toLowerCase() === requester.toLowerCase();
        return currencyMatch && depositorMatch;
    });

    const filteredWithdrawLogs = withdrawLogs.filter(log => {
        const currencyMatch = log.currency?.toLowerCase() === currency.toLowerCase();
        const requesterMatch = log.requester?.toLowerCase() === requester.toLowerCase();
        return currencyMatch && requesterMatch;
    });

    const filteredCancelWithdrawLogs = cancelWithdrawLogs.filter(log => {
        const currencyMatch = log.currency?.toLowerCase() === currency.toLowerCase();
        const requesterMatch = log.requester?.toLowerCase() === requester.toLowerCase();
        return currencyMatch && requesterMatch;
    });

    let totalBalance = BigNumber(0);
    filteredDepositLogs.forEach(log => {
        if (log.currencyAmount) {
            totalBalance = totalBalance.plus(BigNumber(log.currencyAmount));
        }
    });

    filteredWithdrawLogs.forEach(log => {
        if (log.targetTokenAmount) {
            totalBalance = totalBalance.minus(BigNumber(log.targetTokenAmount));
        }
    });

    filteredCancelWithdrawLogs.forEach(log => {
        if (log.targetTokenAmount) {
            totalBalance = totalBalance.plus(BigNumber(log.targetTokenAmount));
        }
    });

    return totalBalance.toString();
}

['bsc', 'ethereum', 'avax', 'bob', 'berachain'].forEach(chain => {
    module.exports[chain] = {
        tvl
    }
})