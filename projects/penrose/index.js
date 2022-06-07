const penLensAbi = require("./penLens.json");
const dystopiaLensAbi = require("./dystopiaLens.json");
const veAbi = require("./ve.json");
const erc20Abi = require("./erc20.json");
const partnerRewardsPoolAddress = "0x5DD340DD4142D093c1926282CD56B0D4690dEB11";
const penV1RewardsPoolAddress = "0x0000000000000000000000000000000000000000";
const penDystRewardPoolAddress = "0x62f9B938323fb68379B9Ac1641012F9BeE339C69";
const vlPenAddress = "0x55CA76E0341ccD35c2E3F34CbF767C6102aea70f";
const penAddress = "0x9008D70A5282a936552593f410AbcBcE2F891A97";
const dystAddress = "0x39aB6574c289c3Ae4d88500eEc792AB5B947A5Eb";
const veAddress = "0x060fa7aD32C510F12550c7a967999810dafC5697";
const penDystAddress = "0x5b0522391d0A5a37FD117fE4C43e8876FB4e91E6";
const sanitize = require("./sanitizeWeb3Response.js");

// const { masterChefExports, standardPoolInfoAbi, addFundsInMasterChef } = require('../helper/masterchef')
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
    // await addFundsInMasterChef(balances, "0xa7821c3e9fc1bf961e280510c471031120716c3d", block, chain,
    //     transform, standardPoolInfoAbi, [], true, true, "0xc165d941481e68696f43ee6e99bfb2b23e0e3114")

    // const screamShare = await sdk.api.abi.call({
    //     ...calldata,
    //     target: xSCREAM,
    //     abi: shareValue
    // })
    // sdk.util.sumSingleBalance(balances, transform("0xe0654C8e6fd4D733349ac7E09f6f23DA256bF475"),
    //     BigNumber(screamShare.output).times(balances[transform(xSCREAM)]).div(1e18).toFixed(0))
    // delete balances[transform(xSCREAM)]

    // const creditShare = await sdk.api.abi.call({
    //     ...calldata,
    //     target: xCREDIT,
    //     abi: shareValue
    // })
    // sdk.util.sumSingleBalance(balances, transform("0x77128dfdd0ac859b33f44050c6fa272f34872b5e"),
    //     BigNumber(creditShare.output).times(balances[transform(xCREDIT)]).div(1e18).toFixed(0))
    // delete balances[transform(xCREDIT)]

    // const tarotShare = await sdk.api.abi.call({
    //     ...calldata,
    //     target: xTAROT,
    //     abi: shareTarot,
    //     params: balances[transform(xTAROT)]
    // })
    // sdk.util.sumSingleBalance(balances, transform("0xc5e2b037d30a390e62180970b3aa4e91868764cd"),
    //     tarotShare.output)
    // delete balances[transform(xTAROT)]

    // sdk.util.sumSingleBalance(balances, transform("0xf24bcf4d1e507740041c9cfd2dddb29585adce1e"),
    //     balances[transform(fBEET)])
    // delete balances[transform(fBEET)]

    // 0xDAO Core
    const penLensAddress = "0x1432c3553FDf7FBD593a84B3A4d380c643cbf7a2";
    const dystopiaLensAddress = "0xDd688a48A511f1341CC57D89e3DcA486e073eaCe";
    // const pen = new web3.eth.Contract(erc20Abi, penAddress);

    // Fetch pools addresses
    const { output: penPoolsAddresses } = await sdk.api.abi.call({
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
        const addresses = penPoolsAddresses.slice(start, end);
        if (addresses.length === 0) {
            break;
        }
        currentPage += 1;

        const { output: poolsData } = await sdk.api.abi.call({
            block,
            chain: 'polygon',
            target: penLensAddress,
            abi: penLensAbi.find(i => i.name === 'penPoolsData')
        })
        const dystopiaPoolsAddresses = poolsData.map((pool) => pool.poolData.id);
        const { output: reservesData } = await sdk.api.abi.call({
            block,
            chain: 'polygon',
            target: dystopiaLensAddress,
            params: [dystopiaPoolsAddresses],
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
        const polygonTokenAddress = `polygon:${tokenAddress}`
        const existingBalance = balances[polygonTokenAddress];
        if (existingBalance) {
            balances[polygonTokenAddress] = new BigNumber(existingBalance).plus(amount).toFixed(0)
        } else {
            balances[polygonTokenAddress] = amount;
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

    // Add locked DYST
    const { output: { amount: lockedDystAmount } } = await sdk.api.abi.call({
        block,
        chain: 'polygon',
        target: veAddress,
        params: 2,
        abi: veAbi.find(i => i.name === 'locked')
    })
    addBalance(dystAddress, lockedDystAmount);

    // // Add staking pools TVL
    // const { output: penV1RewardsPoolBalance } = await sdk.api.abi.call({
    //     block,
    //     chain: 'polygon',
    //     target: penV1RewardsPoolAddress,
    //     abi: erc20Abi.find(i => i.name === 'totalSupply')
    // })
    const { output: penDystRewardsPoolBalance } = await sdk.api.abi.call({
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

    // addBalance(penDystAddress, penV1RewardsPoolBalance);
    addBalance(penDystAddress, partnerRewardsPoolBalance);
    addBalance(penDystAddress, penDystRewardsPoolBalance);

    // Add vote locked PEN
    const { output: voteLockedPenBalance } = await sdk.api.abi.call({
        block,
        chain: 'polygon',
        target: penAddress,
        params: vlPenAddress,
        abi: erc20Abi.find(i => i.name === 'balanceOf')
    })
    addBalance(penAddress, voteLockedPenBalance);

    return balances
}

module.exports = {
    polygon: {
        tvl
    }
}
