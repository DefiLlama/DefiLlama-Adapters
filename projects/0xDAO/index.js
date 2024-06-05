const oxLensAbi = require("./oxLens.json");
const solidlyLensAbi = require("./solidlyLens.json");
const veAbi = require("./ve.json");
const partnerRewardsPoolAddress = "0xDA006E87DB89e1C5213D4bfBa771e53c91D920aC";
const oxdV1RewardsPoolAddress = "0xDA000779663501df3C9Bc308E7cEc70cE6F04211";
const oxSolidRewardPoolAddress = "0xDA0067ec0925eBD6D583553139587522310Bec60";
const vlOxdAddress = "0xDA00527EDAabCe6F97D89aDb10395f719E5559b9";
const oxdAddress = "0xc5A9848b9d145965d821AaeC8fA32aaEE026492d";
const solidAddress = "0x888EF71766ca594DED1F0FA3AE64eD2941740A20";
const veAddress = "0xcBd8fEa77c2452255f59743f55A3Ea9d83b3c72b";
const oxSolidAddress = "0xDA0053F0bEfCbcaC208A3f867BB243716734D809";
const sanitize = require("./sanitizeWeb3Response.js");

const { standardPoolInfoAbi, addFundsInMasterChef } = require('../helper/masterchef')
const sdk = require('@defillama/sdk')

const shareValue = "uint256:getShareValue"
const xSCREAM = "0xe3D17C7e840ec140a7A51ACA351a482231760824"
const xCREDIT = "0xd9e28749e80D867d5d14217416BFf0e668C10645"
const shareTarot = "function shareValuedAsUnderlying(uint256 _share) returns (uint256 underlyingAmount_)"
const xTAROT = "0x74D1D2A851e339B8cB953716445Be7E8aBdf92F4"

const fBEET = "0xfcef8a994209d6916EB2C86cDD2AFD60Aa6F54b1"

async function tvl(_, __, chainBlocks) {
    // 0xDAO Master Chef
    const balances = {}
    const chain = 'fantom'
    const block = chainBlocks[chain]
    const calldata = {
        chain, block
    }
    const transform = addr => `fantom:${addr}`
    await addFundsInMasterChef(balances, "0xa7821c3e9fc1bf961e280510c471031120716c3d", block, chain,
        transform, standardPoolInfoAbi, [], true, true, "0xc165d941481e68696f43ee6e99bfb2b23e0e3114")

    const screamShare = await sdk.api.abi.call({
        ...calldata,
        target: xSCREAM,
        abi: shareValue
    })
    sdk.util.sumSingleBalance(balances, transform("0xe0654C8e6fd4D733349ac7E09f6f23DA256bF475"),
        screamShare.output *balances[transform(xSCREAM)] /1e18)
    delete balances[transform(xSCREAM)]

    const creditShare = await sdk.api.abi.call({
        ...calldata,
        target: xCREDIT,
        abi: shareValue
    })
    sdk.util.sumSingleBalance(balances, transform("0x77128dfdd0ac859b33f44050c6fa272f34872b5e"),
        creditShare.output * balances[transform(xCREDIT)] / 1e18)
    delete balances[transform(xCREDIT)]

    const tarotShare = await sdk.api.abi.call({
        ...calldata,
        target: xTAROT,
        abi: shareTarot,
        params: sdk.util.convertToBigInt(balances[transform(xTAROT)])
    })
    sdk.util.sumSingleBalance(balances, transform("0xc5e2b037d30a390e62180970b3aa4e91868764cd"),
        tarotShare.output)
    delete balances[transform(xTAROT)]

    sdk.util.sumSingleBalance(balances, transform("0xf24bcf4d1e507740041c9cfd2dddb29585adce1e"),
        balances[transform(fBEET)])
    delete balances[transform(fBEET)]

    // 0xDAO Core
    const oxLensAddress = "0xDA00137c79B30bfE06d04733349d98Cf06320e69";
    const solidlyLensAddress = "0xDA0024F99A9889E8F48930614c27Ba41DD447c45";
    // const oxd = new web3.eth.Contract(erc20Abi, oxdAddress);

    // Fetch pools addresses
    const { output: oxPoolsAddresses } = await sdk.api.abi.call({
        block,
        chain: 'fantom',
        target: oxLensAddress,
        abi: oxLensAbi.oxPoolsAddresses
    })
    const pageSize = 200;
    const poolsMap = {};
    let currentPage = 0;

    // Add pools
    const addPools = (pools, reservesData) => {
        pools.forEach((pool) => {
            const solidlyPoolAddress = pool.poolData.id;
            const reserveData = reservesData.find(
                (data) => data.id === solidlyPoolAddress
            );
            const newPool = pool;
            newPool.poolData = {
                ...pool.poolData,
                ...reserveData,
            };
            const shareOfTotalSupply = newPool.totalSupply / newPool.poolData.totalSupply
            newPool.shareOfTotalSupply = shareOfTotalSupply;
            let token0Reserve = newPool.poolData.token0Reserve * shareOfTotalSupply
            let token1Reserve = newPool.poolData.token1Reserve * shareOfTotalSupply
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
    let addresses = []
    while (addresses) {
        const start = currentPage * pageSize;
        const end = start + pageSize;
        addresses = oxPoolsAddresses.slice(start, end);
        if (addresses.length === 0) {
            break;
        }
        currentPage += 1;

        const { output: poolsData } = await sdk.api.abi.call({
            block,
            chain: 'fantom',
            params: [addresses],
            target: oxLensAddress,
            abi: oxLensAbi.oxPoolsData
        })
        const solidlyPoolsAddresses = poolsData.map((pool) => pool.poolData.id);
        const { output: reservesData } = await sdk.api.abi.call({
            block,
            chain: 'fantom',
            target: solidlyLensAddress,
            params: [solidlyPoolsAddresses],
            abi: solidlyLensAbi.poolsReservesInfo
        })
        addPools(
            sanitize(poolsData),
            sanitize(reservesData)
        );
    }
    const pools = Object.values(poolsMap);

    // Add TVL from pools to balances
    const addBalance = (tokenAddress, amount) => {
        const fantomTokenAddress = `fantom:${tokenAddress}`
        sdk.util.sumSingleBalance(balances, fantomTokenAddress, amount)
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
        chain: 'fantom',
        target: veAddress,
        params: 2,
        abi: veAbi.locked
    })
    addBalance(solidAddress, lockedSolidAmount);

    // Add staking pools TVL
    const { output: oxdV1RewardsPoolBalance } = await sdk.api.abi.call({
        block,
        chain: 'fantom',
        target: oxdV1RewardsPoolAddress,
        abi: 'erc20:totalSupply'
    })
    const { output: oxSolidRewardsPoolBalance } = await sdk.api.abi.call({
        block,
        chain: 'fantom',
        target: oxSolidRewardPoolAddress,
        abi: 'erc20:totalSupply'
    })
    const { output: partnerRewardsPoolBalance } = await sdk.api.abi.call({
        block,
        chain: 'fantom',
        target: partnerRewardsPoolAddress,
        abi: 'erc20:totalSupply'
    })

    addBalance(oxSolidAddress, oxdV1RewardsPoolBalance);
    addBalance(oxSolidAddress, partnerRewardsPoolBalance);
    addBalance(oxSolidAddress, oxSolidRewardsPoolBalance);

    // Add vote locked OXD
    const { output: voteLockedOxdBalance } = await sdk.api.abi.call({
        block,
        chain: 'fantom',
        target: oxdAddress,
        params: vlOxdAddress,
        abi: 'erc20:balanceOf'
    })
    addBalance(oxdAddress, voteLockedOxdBalance);

    return balances
}

module.exports = {
    fantom: {
        tvl
    }
}
