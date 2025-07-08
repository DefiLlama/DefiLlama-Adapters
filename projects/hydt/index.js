const { sumUnknownTokens, nullAddress, } = require('../helper/unknownTokens');
const { sumTokens2 } = require('../helper/unwrapLPs');

const chain = "bsc";

const earn = "0x8e48d5b2Ac80d9861d07127F06BbF02F73520Ced";
const farm = "0x4590BaD61aE62ACFF33032e3Bf64b52b7264A779";
const hydt = "0x9810512be701801954449408966c630595d0cd51";
const reserve = "0xc5161aE3437C08036B98bDb58cfE6bBfF876c177";
const shydt = "0xab4f1Bb558E564ae294D45a025111277c36C89c0";

const bnb = nullAddress;
const controlPair = "0xBB8ae522F812E9E65239A0e5db87a9D738ce957a";

async function tvl(_, _b, _cb) {
    return sumTokens2({ chain, owner: reserve, tokens: [bnb] });
}

async function staking(api) {
    // earn
    const shydtBal = await api.call({ abi: 'erc20:balanceOf', target: shydt, params: earn, });
    api.add(hydt, shydtBal);

    // farm
    const pools = await api.fetchList({
        lengthAbi: 'uint256:poolLength',
        itemAbi: 'function poolInfo(uint256) external view returns (address lpToken, uint256 allocPoint, uint256, uint256)',
        target: farm,
    });
    const lpTokens = [];
    pools.forEach(i => { if (i.allocPoint > 0) lpTokens.push(i.lpToken) });
    const calls = lpTokens.map(i => ({
        target: i,
        params: farm
    }));
    const lpBals = await api.multiCall({ abi: 'erc20:balanceOf', calls, });
    lpTokens.forEach((i, index) => api.add(i, lpBals[index]));

    return sumUnknownTokens({ api, lps: [controlPair], resolveLP: true, useDefaultCoreAssets: true, });
}

module.exports = {
    misrepresentedTokens: true,
    methodology: "Retrieving the reserve BNB balance for TVL. Retrieving the staked amounts for HYDT from the earn (HYDT staking) contract and the LP Tokens from the farm contract for staking.",
    start: '2023-09-03',
    bsc: {
        tvl,
        staking,
    },
};
