const { default: BigNumber } = require("bignumber.js");
const { getConfig } = require("../helper/cache");
const { getLogs } = require('../helper/cache/getLogs')
const sdk = require('@defillama/sdk')
const ethers = require('ethers');

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
            const balance = await routerEvents(api, routerV2, solvbtcAddress);
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


async function routerEvents(api, routerV2, solvbtcAddress) {
    if (!routerV2["contractAddress"] && !routerV2["tokenAddress"] && !routerV2["requester"] && !solvbtcAddress) {
        return;
    }
    let { contractAddress, fromBlock, tokenAddress, requester } = routerV2;

    const toBlock = api.block;
    
    let [depositLogsRaw, withdrawLogsRaw, cancelWithdrawLogsRaw] = await Promise.all([
        sdk.api.util.getLogs({
            target: contractAddress,
            topic: '0x6937da7733b7e101e4ab6e3a3ec12fe857d7a7ca921348ef12feff7abfcee01a',
            fromBlock: fromBlock,
            toBlock: toBlock,
            chain: api.chain
        }),
        sdk.api.util.getLogs({
            target: contractAddress,
            topic: '0x50aa488fffd286866bc78078718365f7c3880cf5f95179a61e37cf84c5fd76c5',
            fromBlock: fromBlock,
            toBlock: toBlock,
            chain: api.chain
        }),
        sdk.api.util.getLogs({
            target: contractAddress,
            topic: '0xbcab14a9990bc1fc30373acf248d280252f63653e6ccdcbd1f7929552a84c738',
            fromBlock: fromBlock,
            toBlock: toBlock,
            chain: api.chain
        })
    ]);
    
    depositLogsRaw = depositLogsRaw || { output: [] };
    withdrawLogsRaw = withdrawLogsRaw || { output: [] };
    cancelWithdrawLogsRaw = cancelWithdrawLogsRaw || { output: [] };

    const depositInterface = new ethers.Interface([
        'event Deposit(address indexed targetToken, address indexed currency, address indexed depositor, uint256 targetTokenAmount, uint256 currencyAmount, address[] path, bytes32[] poolIds)'
    ]);

    const depositLogs = (depositLogsRaw.output || []).map(log => {
        try {
            const parsed = depositInterface.parseLog(log);
            return {
                targetToken: parsed.args.targetToken,
                currency: parsed.args.currency,
                depositor: parsed.args.depositor,
                targetTokenAmount: parsed.args.targetTokenAmount.toString(),
                currencyAmount: parsed.args.currencyAmount.toString(),
                path: parsed.args.path,
                poolIds: parsed.args.poolIds
            };
        } catch (error) {
            return null;
        }
    }).filter(Boolean);

    const withdrawInterface = new ethers.Interface([
        'event WithdrawRequest(address indexed targetToken, address indexed currency, address indexed requester, bytes32 poolId, uint256 withdrawAmount, uint256 redemptionId)'
    ]);

    const withdrawLogs = (withdrawLogsRaw.output || []).map(log => {
        try {
            const parsed = withdrawInterface.parseLog(log);
            return {
                targetToken: parsed.args.targetToken,
                currency: parsed.args.currency,
                requester: parsed.args.requester,
                poolId: parsed.args.poolId,
                withdrawAmount: parsed.args.withdrawAmount.toString(),
                redemptionId: parsed.args.redemptionId.toString()
            };
        } catch (error) {
            return null;
        }
    }).filter(Boolean);

    const cancelWithdrawInterface = new ethers.Interface([
        'event CancelWithdrawRequest(address indexed targetToken, address indexed redemption, address indexed requester, bytes32 poolId, uint256 redemptionId, uint256 targetTokenAmount)'
    ]);

    const cancelWithdrawLogs = (cancelWithdrawLogsRaw.output || []).map(log => {
        try {
            const parsed = cancelWithdrawInterface.parseLog(log);
            return {
                targetToken: parsed.args.targetToken,
                redemption: parsed.args.redemption,
                requester: parsed.args.requester,
                poolId: parsed.args.poolId,
                redemptionId: parsed.args.redemptionId.toString(),
                targetTokenAmount: parsed.args.targetTokenAmount.toString()
            };
        } catch (error) {
            return null;
        }
    }).filter(Boolean);

    const filteredDepositLogs = depositLogs.filter(log => {
        const currencyMatch = log.currency?.toLowerCase() === solvbtcAddress.toLowerCase();
        const targetTokenMatch = log.targetToken?.toLowerCase() === tokenAddress.toLowerCase();
        const depositorMatch = log.depositor?.toLowerCase() === requester.toLowerCase();
        return currencyMatch && depositorMatch && targetTokenMatch;
    });

    const filteredWithdrawLogs = withdrawLogs.filter(log => {
        const currencyMatch = log.currency?.toLowerCase() === tokenAddress.toLowerCase();
        const targetTokenMatch = log.targetToken?.toLowerCase() === solvbtcAddress.toLowerCase();
        const requesterMatch = log.requester?.toLowerCase() === requester.toLowerCase();
        return currencyMatch && requesterMatch && targetTokenMatch;
    });

    const filteredCancelWithdrawLogs = cancelWithdrawLogs.filter(log => {
        const targetTokenMatch = log.targetToken?.toLowerCase() === tokenAddress.toLowerCase();
        const requesterMatch = log.requester?.toLowerCase() === requester.toLowerCase();
        return targetTokenMatch && requesterMatch;
    });

    let totalBalance = BigNumber(0);
    filteredDepositLogs.forEach(log => {
        if (log.targetTokenAmount) {
            totalBalance = totalBalance.plus(BigNumber(log.targetTokenAmount));
        }
    });

    filteredWithdrawLogs.forEach(log => {
        if (log.withdrawAmount) {
            totalBalance = totalBalance.minus(BigNumber(log.withdrawAmount));
        }
    });

    filteredCancelWithdrawLogs.forEach(log => {
        if (log.targetTokenAmount) {
            totalBalance = totalBalance.plus(BigNumber(log.targetTokenAmount));
        }
    });

    return totalBalance.gt(0) ? totalBalance.toString() : 0;
}

['bsc', 'ethereum', 'avax', 'bob', 'berachain'].forEach(chain => {
    module.exports[chain] = {
        tvl
    }
})