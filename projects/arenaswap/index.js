const sdk = require("@defillama/sdk");
const {addFundsInMasterChef} = require("../helper/masterchef");
const arena = "0x2A17Dc11a1828725cdB318E0036ACF12727d27a2";
const arenaMasterChef = "0xbEa60d145747a66CF27456ef136B3976322b7e77";
const pyram = "0xedeCfB4801C04F3EB394b89397c6Aafa4ADDa15B";
const pyramMasterChef = "0x3e91B21ddE13008Aa73f07BdE26970322Fe5D533";
const poolInfo = {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"poolInfo","outputs":[{"internalType":"contract IBEP20","name":"lpToken","type":"address"},{"internalType":"uint256","name":"allocPoint","type":"uint256"},{"internalType":"uint256","name":"lastRewardBlock","type":"uint256"},{"internalType":"uint256","name":"accArenaPerShare","type":"uint256"},{"internalType":"uint16","name":"depositFeeBP","type":"uint16"},{"internalType":"uint256","name":"harvestInterval","type":"uint256"}],"stateMutability":"view","type":"function"};

async function tvl(timestamp, block, chainBlocks) {
    let balances = {};
    await addFundsInMasterChef(balances, arenaMasterChef, chainBlocks.bsc, "bsc", addr => `bsc:${addr}`, poolInfo, [arena], true, false, arena);
    await addFundsInMasterChef(balances, pyramMasterChef, chainBlocks.bsc, "bsc", addr => `bsc:${addr}`, poolInfo, [pyram], true, false, pyram);
    return balances;
}

async function staking(timestamp, block, chainBlocks) {
    let balances = {};
    let arenaStakingBalance = (await sdk.api.erc20.balanceOf({
        target: arena,
        owner: arenaMasterChef,
        block: chainBlocks.bsc,
        chain: "bsc"
    })).output;
    sdk.util.sumSingleBalance(balances, `bsc:${arena}`, arenaStakingBalance);
    let pyramStakingBalances = (await sdk.api.abi.multiCall({
        calls: [
            {
                target: arena,
                params: pyramMasterChef
            },
            {
                target: pyram,
                params: pyramMasterChef
            }
        ],
        abi: "erc20:balanceOf",
        block: chainBlocks.bsc,
        chain: "bsc"
    })).output;
    for (let i in pyramStakingBalances) {
        sdk.util.sumSingleBalance(balances, `bsc:${pyramStakingBalances[i].input.target}`, pyramStakingBalances[i].output);
    }
    return balances;
}


module.exports = {
    methodology: "Counts value locked in farms and pools",
    bsc: {
        tvl,
        staking
    },
    tvl
}