const {unwrapUniswapLPs} = require("../helper/unwrapLPs");
const {getChainTransform} = require("../helper/portedTokens");

const FARM_MASTER = "0x19A497E9c034c0D66952366F46f0e4e8b27465a8";
const blacklistedTokens = []

const abis = {
    name: "string:name",
    wantLockedTotal: "uint256:wantLockedTotal",
    poolInfo: "function poolInfo(uint256) view returns (address want, uint256 allocPoint, uint256 lastRewardTime, address strategy, uint256 earlyWithdrawFee, uint256 earlyWithdrawTime)",
}

module.exports = {
    start: 1724346000,
    cronos_zkevm: {
        tvl,
    }
}

async function tvl(api, _b, chainBlocks) {
    const balances = {};
    const chainLocal = "cronos_zkevm";

    const poolInfos = await api.fetchList({lengthAbi: 'poolLength', itemAbi: abis.poolInfo, target: FARM_MASTER})
    const allPoolInfos = poolInfos.filter(el => !blacklistedTokens.includes(el.toLowerCase))
    const transformAddress = await getChainTransform(chainLocal);

    const wantedAddresses = allPoolInfos.map(i => i.want)

    const wrapTarget = v => ({
        target: v
    });

    const wantedLocked = (await api.multiCall({
        abi: abis.wantLockedTotal,
        calls: allPoolInfos.map(i => wrapTarget(i.strategy)),
        permitFailure: true
    }))
    const vaultName = (await api.multiCall({
        abi: abis.name,
        calls: allPoolInfos.map(i => wrapTarget(i.want)),
        permitFailure: true
    })).map(i => i ?? "")
    const lpPositions = [];
    for (let k = 0; k < wantedLocked.length; k++) {
        if (vaultName[k].toLowerCase().endsWith(" lps") || vaultName[k].toLowerCase().endsWith(" lp")) {
            lpPositions.push({
                token: wantedAddresses[k],
                balance: wantedLocked[k],
            });
        } else {
            api.sumSingleBalance(
                balances,
                `${chainLocal}:${wantedAddresses[k]}`,
                wantedLocked[k]
            );
        }
    }
    await unwrapUniswapLPs(
        balances,
        lpPositions,
        chainBlocks[chainLocal],
        chainLocal,
        transformAddress
    );

    return balances;
}