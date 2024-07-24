const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const bn = require('bignumber.js');
const abi = require('../helper/abis/masterchef.json');
const { unwrapLPsAuto } = require('../helper/unwrapLPs');
const userInfoAbi = 'function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt)'
const { getChainTransform } = require('../helper/portedTokens');
const { camelotMasterAbi, camelotNFTPoolAbi, camelotNitroPoolAbi, wCamelotSpNFTAbi } = require("./abi")

/** this is adapted from `projects/helpers/masterchef/getUserMasterChefBalances`
  * to deal with VVS's CraftsmanV2 Contract, which does not have 
  * `poolLength`, amongst other things.
  */
async function getUserCraftsmanV2Balances({ balances = {}, masterChefAddress, userAddres, block, chain = 'ethereum', transformAddress, excludePool2 = false, onlyPool2 = false, pool2Tokens = [], poolInfoABI = abi.poolInfo, craftsmanV1 }) {
    if (!transformAddress)
        transformAddress = await getChainTransform(chain);

    const tempBalances = {};
    const poolLength = (await sdk.api.abi.call({ abi: abi.poolLength, target: craftsmanV1, block, chain, })).output;
    const dummyArray = Array.from(Array(Number(poolLength)).keys());
    // pids of CraftsmanV1 and CraftsmanV2 share same lpToken
    const poolInfoCalls = dummyArray.map(i => ({ target: craftsmanV1, params: i, }));
    const userInfoCalls = dummyArray.map(i => ({ target: masterChefAddress, params: [i, userAddres], }));
    const lpTokens = (await sdk.api.abi.multiCall({ block, calls: poolInfoCalls, abi: poolInfoABI, chain, })).output
        .map(a => a.output && a.output[0]);
    const userBalances = (await sdk.api.abi.multiCall({ block, calls: userInfoCalls, abi: userInfoAbi, chain, })).output
        .map(a => a.output[0]);

    userBalances.forEach((balance, idx) => {
        if (isNaN(+balance) || +balance <= 0)
            return;
        tempBalances[transformAddress(lpTokens[idx])] = balance;
    });
    
    await unwrapLPsAuto({ balances: tempBalances, chain, block, transformAddress, excludePool2, onlyPool2, pool2Tokens });

    Object.keys(tempBalances).forEach(key => sdk.util.sumSingleBalance(balances, key, tempBalances[key]));

    return balances;
}

async function getUserCamelotMasterBalances({ balances = {}, masterChefAddress, userAddres: wCamelotSpNFT, block, chain = 'ethereum', transformAddress, excludePool2 = false, onlyPool2 = false, pool2Tokens = [] }) {
    if (!transformAddress)
        transformAddress = await getChainTransform(chain);

    const tempBalances = {};
    const poolLength = (await sdk.api.abi.call({ abi: camelotMasterAbi.poolLength, target: masterChefAddress, block, chain, })).output;

    const dummyArray = Array.from(Array(Number(poolLength)).keys());
    const poolAddressCalls = dummyArray.map(i => ({ target: masterChefAddress, params: i, }));
    const poolAddresses = (await sdk.api.abi.multiCall({ block, calls: poolAddressCalls, abi: camelotMasterAbi.getPoolAddressByIndex, chain, })).output
        .map(a => a.output)

    const poolInfoCalls = dummyArray.map(i => ({ target: poolAddresses[i] }));
    const lpTokens = (await sdk.api.abi.multiCall({ block, calls: poolInfoCalls, abi: camelotNFTPoolAbi.getPoolInfo, chain, })).output
        .map(a => a.output.lpToken)

    const userSpNFTBalanceCalls = dummyArray.map(i => ({ target: poolAddresses[i], params: wCamelotSpNFT, }));
    const userSpNFTBalance = (await sdk.api.abi.multiCall({ block, calls: userSpNFTBalanceCalls, abi: camelotNFTPoolAbi.balanceOf, chain, })).output
        .map(a => a.output)

    const userLpBalance = await Promise.all(userSpNFTBalance.map(async (spNFTBalance, idx) => {
        if (isNaN(+spNFTBalance) || +spNFTBalance <= 0) return;
        const dummySpNFTArray = Array.from(Array(Number(spNFTBalance)).keys());
        const spNFTIdCalls = dummySpNFTArray.map(i => ({ target: poolAddresses[idx], params: [wCamelotSpNFT, i]  }));
        const userSpNFTId = (await sdk.api.abi.multiCall({ block, calls: spNFTIdCalls, abi: camelotNFTPoolAbi.tokenOfOwnerByIndex, chain, })).output
            .map(a => a.output)
        const stakingPositionsCalls = dummySpNFTArray.map(i => ({ target: poolAddresses[idx], params: userSpNFTId[i]  }));
        const userLpBalance = (await sdk.api.abi.multiCall({ block, calls: stakingPositionsCalls, abi: camelotNFTPoolAbi.getStakingPosition, chain, })).output
            .map(a => a.output.amount)
        return {
            lpToken: lpTokens[idx],
            balance: userLpBalance.reduce((partialSum, a) => partialSum.plus(a), bn(0)).toFixed()
        };
    }))
    userLpBalance.forEach((data, idx) => {
        if (!data) return;
        tempBalances[transformAddress(data.lpToken)] = data.balance
    })

    const nitroPoolAddressesCalls = dummyArray.map(i => ({ target: wCamelotSpNFT, params: i }));
    const nitroPoolAddresses = (await sdk.api.abi.multiCall({ block, calls: nitroPoolAddressesCalls, abi: wCamelotSpNFTAbi.stakedNitroPool, chain, })).output
        .map(a => a.output)
    const nitroPoolUserLpBalanceCalls = nitroPoolAddresses
        .filter((v) => v !== ADDRESSES.null)
        .map((v, i) => ({ target: v, params: wCamelotSpNFT  }));
    const nitroPoolUserLpBalance = (await sdk.api.abi.multiCall({ block, calls: nitroPoolUserLpBalanceCalls, abi: camelotNitroPoolAbi.userInfo, chain, })).output
        .map((v, i) => {
            if (!v.output?.totalDepositAmount || v.output.totalDepositAmount === "0") return
            const lpTokenIdx = nitroPoolAddresses.findIndex(addr => addr === nitroPoolUserLpBalanceCalls[i].target)
            if (lpTokenIdx === -1) return;
            return {
                lpToken: lpTokens[lpTokenIdx],
                balance: v.output.totalDepositAmount
            }
        })
    nitroPoolUserLpBalance.forEach((data, idx) => {
        if (!data) return;
        if (tempBalances[transformAddress(data.lpToken)]) {
            tempBalances[transformAddress(data.lpToken)] = bn(tempBalances[transformAddress(data.lpToken)]).plus(data.balance).toFixed()
        } else {
            tempBalances[transformAddress(data.lpToken)] = data.balance
        }
    })

    await unwrapLPsAuto({ balances: tempBalances, chain, block, transformAddress, excludePool2, onlyPool2, pool2Tokens });
    Object.keys(tempBalances).forEach(key => sdk.util.sumSingleBalance(balances, key, tempBalances[key]));
    return balances;
}

module.exports = {
    getUserCraftsmanV2Balances,
    getUserCamelotMasterBalances,
}