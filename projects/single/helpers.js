const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('../helper/abis/masterchef.json');
const { unwrapLPsAuto } = require('../helper/unwrapLPs');
const userInfoAbi = 'function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt)'
const { camelotMasterAbi, camelotNFTPoolAbi, camelotNitroPoolAbi, wCamelotSpNFTAbi } = require("./abi")

/** this is adapted from `projects/helpers/masterchef/getUserMasterChefBalances`
  * to deal with VVS's CraftsmanV2 Contract, which does not have 
  * `poolLength`, amongst other things.
  */
async function getUserCraftsmanV2Balances({ api, masterChefAddress, userAddres, excludePool2 = false, onlyPool2 = false, pool2Tokens = [], poolInfoABI = abi.poolInfo, craftsmanV1 }) {
    return {}
    const lpTokens = (await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: poolInfoABI, target: craftsmanV1 })).map(a => a[0])
    const dummyArray = Array.from(Array(lpTokens.length).keys());
    // pids of CraftsmanV1 and CraftsmanV2 share same lpToken
    const userInfoCalls = dummyArray.map(i => ({ target: masterChefAddress, params: [i, userAddres], }));
    const userBalances = (await api.multiCall({ calls: userInfoCalls, abi: userInfoAbi, })).map(a => a[0]);
    api.add(lpTokens, userBalances);

    await unwrapLPsAuto({ api, excludePool2, onlyPool2, pool2Tokens });
    // await unwrapLPsAuto({ balances: api.getBalances(), chain: api.chain, block: api.block, excludePool2, onlyPool2, pool2Tokens });
}

async function getUserCamelotMasterBalances({ api, masterChefAddress, userAddres: wCamelotSpNFT, excludePool2 = false, onlyPool2 = false, pool2Tokens = [] }) {
    return {}
    const poolAddresses = await api.fetchList({ lengthAbi: camelotMasterAbi.poolLength, itemAbi: camelotMasterAbi.getPoolAddressByIndex, target: masterChefAddress })
    const lpTokens = (await api.multiCall({ abi: camelotNFTPoolAbi.getPoolInfo, calls: poolAddresses })).map(a => a.lpToken)

    const dummyArray = Array.from(Array(poolAddresses.lengthAbi).keys());


    const userSpNFTBalanceCalls = dummyArray.map(i => ({ target: poolAddresses[i], params: wCamelotSpNFT, }));
    const userSpNFTBalance = (await api.multiCall({ calls: userSpNFTBalanceCalls, abi: camelotNFTPoolAbi.balanceOf, }))

    await Promise.all(userSpNFTBalance.map(async (spNFTBalance, idx) => {
        if (isNaN(+spNFTBalance) || +spNFTBalance <= 0) return;
        const dummySpNFTArray = Array.from(Array(Number(spNFTBalance)).keys());
        const spNFTIdCalls = dummySpNFTArray.map(i => ({ target: poolAddresses[idx], params: [wCamelotSpNFT, i] }));
        const userSpNFTId = (await api.multiCall({ calls: spNFTIdCalls, abi: camelotNFTPoolAbi.tokenOfOwnerByIndex, }))
        const stakingPositionsCalls = dummySpNFTArray.map(i => ({ target: poolAddresses[idx], params: userSpNFTId[i] }));
        const userLpBalance = (await api.multiCall({ calls: stakingPositionsCalls, abi: camelotNFTPoolAbi.getStakingPosition, }))
        api.add(lpTokens[idx], userLpBalance)
    }))

    const nitroPoolAddressesCalls = dummyArray.map(i => ({ target: wCamelotSpNFT, params: i }));
    const nitroPoolAddresses = (await api.multiCall({ calls: nitroPoolAddressesCalls, abi: wCamelotSpNFTAbi.stakedNitroPool, }))
    const nitroPoolUserLpBalanceCalls = nitroPoolAddresses
        .filter((v) => v !== ADDRESSES.null)
        .map((v, i) => ({ target: v, params: wCamelotSpNFT }));
    const nitroPoolUserLpBalance = await api.multiCall({ calls: nitroPoolUserLpBalanceCalls, abi: camelotNitroPoolAbi.userInfo, })

    nitroPoolUserLpBalance.map((v, i) => {
        if (!v?.totalDepositAmount || v.totalDepositAmount === "0") return
        const lpTokenIdx = nitroPoolAddresses.findIndex(addr => addr === nitroPoolUserLpBalanceCalls[i].target)
        if (lpTokenIdx === -1) return;
        api.add(lpTokens[lpTokenIdx], v.totalDepositAmount)
    })

    await unwrapLPsAuto({ api, excludePool2, onlyPool2, pool2Tokens });
}

module.exports = {
    getUserCraftsmanV2Balances,
    getUserCamelotMasterBalances,
}