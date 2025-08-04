const { default: BigNumber } = require("bignumber.js");
const { getConfig } = require("../helper/cache");
const { getLogs } = require('../helper/cache/getLogs');

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
            const balance = await calculateFromGetLogs(
                api,
                routerV2.contractAddress,
                routerV2.tokenAddress,
                solvbtcAddress,
                routerV2.requester,
                routerV2.fromBlock
            );
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

async function calculateFromGetLogs(api, contractAddress, tokenAddress, solvbtcAddress, requester, fromBlock) {
    try {
        const [depositLogs, withdrawLogs, cancelWithdrawLogs] = await Promise.all([
            getLogs({
                api,
                target: contractAddress,
                topic: '0x6937da7733b7e101e4ab6e3a3ec12fe857d7a7ca921348ef12feff7abfcee01a',
                fromBlock: fromBlock,
                toBlock: api.block,
                onlyArgs: true,
                onlyUseExistingCache: false,
                eventAbi: 'event Deposit(address indexed targetToken, address indexed currency, address indexed depositor, uint256 targetTokenAmount, uint256 currencyAmount, address[] path, bytes32[] poolIds)'
            }),
            getLogs({
                api,
                target: contractAddress,
                topic: '0x50aa488fffd286866bc78078718365f7c3880cf5f95179a61e37cf84c5fd76c5',
                fromBlock: fromBlock,
                toBlock: api.block,
                onlyArgs: true,
                onlyUseExistingCache: false,
                eventAbi: 'event WithdrawRequest(address indexed targetToken, address indexed currency, address indexed requester, bytes32 poolId, uint256 withdrawAmount, uint256 redemptionId)'
            }),
            getLogs({
                api,
                target: contractAddress,
                topic: '0xbcab14a9990bc1fc30373acf248d280252f63653e6ccdcbd1f7929552a84c738',
                fromBlock: fromBlock,
                toBlock: api.block,
                onlyArgs: true,
                onlyUseExistingCache: false,
                eventAbi: 'event CancelWithdrawRequest(address indexed targetToken, address indexed redemption, address indexed requester, bytes32 poolId, uint256 redemptionId, uint256 targetTokenAmount)'
            })
        ]);

        const filteredDeposits = (depositLogs || []).filter(log => {
            const currencyMatch = log.currency?.toLowerCase() === solvbtcAddress.toLowerCase();
            const targetTokenMatch = log.targetToken?.toLowerCase() === tokenAddress.toLowerCase();
            const depositorMatch = log.depositor?.toLowerCase() === requester.toLowerCase();
            return currencyMatch && targetTokenMatch && depositorMatch;
        });

        const filteredWithdraws = (withdrawLogs || []).filter(log => {
            const currencyMatch = log.currency?.toLowerCase() === tokenAddress.toLowerCase();
            const targetTokenMatch = log.targetToken?.toLowerCase() === solvbtcAddress.toLowerCase();
            const requesterMatch = log.requester?.toLowerCase() === requester.toLowerCase();
            return currencyMatch && targetTokenMatch && requesterMatch;
        });

        const filteredCancelWithdraws = (cancelWithdrawLogs || []).filter(log => {
            const targetTokenMatch = log.targetToken?.toLowerCase() === tokenAddress.toLowerCase();
            const requesterMatch = log.requester?.toLowerCase() === requester.toLowerCase();
            return targetTokenMatch && requesterMatch;
        });
        let totalDepositAmount = BigNumber(0);
        let totalWithdrawAmount = BigNumber(0);
        let totalCancelWithdrawAmount = BigNumber(0);

        filteredDeposits.forEach(log => {
            if (log.targetTokenAmount) {
                totalDepositAmount = totalDepositAmount.plus(BigNumber(log.targetTokenAmount.toString()));
            }
        });

        filteredWithdraws.forEach(log => {
            if (log.withdrawAmount) {
                totalWithdrawAmount = totalWithdrawAmount.plus(BigNumber(log.withdrawAmount.toString()));
            }
        });

        filteredCancelWithdraws.forEach(log => {
            if (log.targetTokenAmount) {
                totalCancelWithdrawAmount = totalCancelWithdrawAmount.plus(BigNumber(log.targetTokenAmount.toString()));
            }
        });

        const netBalance = totalDepositAmount.plus(totalCancelWithdrawAmount).minus(totalWithdrawAmount);

        return netBalance.toNumber() > 0 ? netBalance.toString() : "0";

    } catch (error) {
        return "0";
    }
}

['bsc', 'ethereum', 'avax', 'bob', 'berachain'].forEach(chain => {
    module.exports[chain] = {
        tvl
    }
})