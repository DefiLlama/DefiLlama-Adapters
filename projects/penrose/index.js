const penLensAbi = require("./penLens.json");
const dystopiaLensAbi = require("./dystLens.json");
const veAbi = require("./ve.json");
const erc20Abi = require("./erc20.json");
const partnerRewardsPoolAddress = "0xd1A9F69E94E3B9D646D6928f8Ead596dc50e6b18";
const penDystRewardPoolAddress = "0x8d05FC2232b595Fa323EbA64f073460A6F3728de";
const vlPenAddress = "0xaa0FF6a08F8D9aB30064F5E98E585D165336a898";
const penAddress = "0xc3559c37C2020A44E74eA2C6E0F009b531FB4eD3";
const dystopiaAddress = "0x39aB6574c289c3Ae4d88500eEc792AB5B947A5Eb";
const veAddress = "0x060fa7aD32C510F12550c7a967999810dafC5697";
const penDystAddress = "0xFB8D5bbcc0f09916cF004C1Ab8EAA56bb73dc679";
const sanitize = require("./sanitizeWeb3Response.js");

const { masterChefExports, standardPoolInfoAbi, addFundsInMasterChef } = require('../helper/masterchef')
const sdk = require('@defillama/sdk')
const { default: BigNumber } = require('bignumber.js')

const shareValue = { "inputs": [], "name": "getShareValue", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
const xSCREAM = "0xe3D17C7e840ec140a7A51ACA351a482231760824"
const xCREDIT = "0xd9e28749e80D867d5d14217416BFf0e668C10645"
const shareTarot = { "inputs": [{ "internalType": "uint256", "name": "_share", "type": "uint256" }], "name": "shareValuedAsUnderlying", "outputs": [{ "internalType": "uint256", "name": "underlyingAmount_", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }
const xTAROT = "0x74D1D2A851e339B8cB953716445Be7E8aBdf92F4"

const fBEET = "0xfcef8a994209d6916EB2C86cDD2AFD60Aa6F54b1"

async function tvl(time, ethBlock, chainBlocks) {
    // 0xDAO Master Chef
    const balances = {}
    const chain = 'polygon'
    const block = chainBlocks[chain]
    const calldata = {
        chain, block
    }
    const transform = addr => `polygon:${addr}`

    // Penrose Core
    const penLensAddress = "0x12bb4E7e868627049AD62B1Aefa11dEbaB446c8A";
    const solidlyLensAddress = "0xe72c3FA9Edf5A996d210fA9FC7D481dEe602aeE2";
    // const oxd = new web3.eth.Contract(erc20Abi, oxdAddress);

    // Fetch pools addresses
    const { output: penPoolAddresses } = await sdk.api.abi.call({
        block,
        chain: 'polygon',
        target: penLensAddress,
        abi: penLensAbi.find(i => i.name === 'penPoolsAddresses')
    })
    const pageSize = 50;
    const poolsMap = {};
    let currentPage = 0;

    // Add pools
    const addPools = (pools, reservesData) => {
        pools.forEach((pool, index) => {
            const dystopiaPoolAddress = pool.poolData.id;
            const reserveData = reservesData.find(
                (data) => data.id === dystopiaPoolAddress
            );
            const newPool = pool;
            newPool.poolData = {
                ...pool.poolData,
                ...reserveData,
            };
            const shareOfTotalSupply = new BigNumber(newPool.totalSupply).div(newPool.poolData.totalSupply).toFixed()
            newPool.shareOfTotalSupply = shareOfTotalSupply;
            let token0Reserve = new BigNumber(newPool.poolData.token0Reserve).times(shareOfTotalSupply).toFixed(0);
            let token1Reserve = new BigNumber(newPool.poolData.token1Reserve).times(shareOfTotalSupply).toFixed(0);
            if (isNaN(token0Reserve)) {
                token0Reserve = "0"
            }
            if (isNaN(token1Reserve)) {
                token1Reserve = "0"
            }
            newPool.token0Reserve = token0Reserve;
            newPool.token1Reserve = token1Reserve;
            poolsMap[pool.id] = newPool;
        });
    };
    while (true) {
        const start = currentPage * pageSize;
        const end = start + pageSize;
        const addresses = penPoolAddresses.slice(start, end);
        if (addresses.length === 0) {
            break;
        }
        currentPage += 1;

        const { output: poolsData } = await sdk.api.abi.call({
            block,
            chain: 'polygon',
            params: [addresses],
            target: penLensAddress,
            abi: penLensAbi.find(i => i.name === 'penPoolsData')
        })
        const solidlyPoolsAddresses = poolsData.map((pool) => pool.poolData.id);
        const { output: reservesData } = await sdk.api.abi.call({
            block,
            chain: 'polygon',
            target: solidlyLensAddress,
            params: [solidlyPoolsAddresses],
            abi: dystopiaLensAbi.find(i => i.name === 'poolsReservesInfo')
        })
        addPools(
            sanitize(poolsData),
            sanitize(reservesData)
        );
    }
    const pools = Object.values(poolsMap);

    // Add TVL from pools to balances
    const addBalance = (tokenAddress, amount) => {
        const fantomTokenAddress = `polygon:${tokenAddress}`
        const existingBalance = balances[fantomTokenAddress];
        if (existingBalance) {
            balances[fantomTokenAddress] = new BigNumber(existingBalance).plus(amount).toFixed(0)
        } else {
            balances[fantomTokenAddress] = amount;
        }
    }
    pools.forEach(pool => {
        const token0 = pool.poolData.token0Address;
        const token1 = pool.poolData.token1Address;
        const amount0 = pool.token0Reserve;
        const amount1 = pool.token1Reserve;
        addBalance(token0, amount0);
        addBalance(token1, amount1);
    });

    // Add locked SOLID
    const { output: { amount: lockedSolidAmount } } = await sdk.api.abi.call({
        block,
        chain: 'polygon',
        target: veAddress,
        params: 2,
        abi: veAbi.find(i => i.name === 'locked')
    })
    addBalance(dystopiaAddress, lockedSolidAmount);

    // Add staking pools TVL
    const { output: oxSolidRewardsPoolBalance } = await sdk.api.abi.call({
        block,
        chain: 'polygon',
        target: penDystRewardPoolAddress,
        abi: erc20Abi.find(i => i.name === 'totalSupply')
    })
    const { output: partnerRewardsPoolBalance } = await sdk.api.abi.call({
        block,
        chain: 'polygon',
        target: partnerRewardsPoolAddress,
        abi: erc20Abi.find(i => i.name === 'totalSupply')
    })

    addBalance(penDystAddress, partnerRewardsPoolBalance);
    addBalance(penDystAddress, oxSolidRewardsPoolBalance);

    // Add vote locked OXD
    const { output: voteLockedOxdBalance } = await sdk.api.abi.call({
        block,
        chain: 'polygon',
        target: penAddress,
        params: vlPenAddress,
        abi: erc20Abi.find(i => i.name === 'balanceOf')
    })
    addBalance(penAddress, voteLockedOxdBalance);

    return balances
}

module.exports = {
    polygon: {
        tvl
    }
}
