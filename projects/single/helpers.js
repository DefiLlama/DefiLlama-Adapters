const sdk = require('@defillama/sdk');
const abi = require('../helper/abis/masterchef.json');
const { unwrapLPsAuto } = require('../helper/unwrapLPs');
const userInfoAbi = require("../helper/abis/userInfo.json");
const { default: BigNumber } = require('bignumber.js');
const { getChainTransform } = require('../helper/portedTokens');

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

module.exports = {
    getUserCraftsmanV2Balances
}