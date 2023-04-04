const { calculateUsdTvl } = require('./getUsdTvl')
const { getExports } = require('../helper/heroku-api')

const moonriverStablePoolTokenMap = {
    "0xffc7780c34b450d917d557e728f033033cb4fa8c": "0xffffffff1fcacbd218edc0eba20fc2308c778080", // stKSM -> xcKSM
}


const MoonriverStableSwapContractAddress = [
    "0x7BDE79AD4ae9023AC771F435A1DC6efdF3F434D1", // USDT/USDC/xcAUSD/FRAX
    "0xd38A007F60817635163637411353BB1987209827", // xcKSM/stKSM
  ];

const MoonbeamStableSwapContractAddress = [
    '0x68bed2c54Fd0e6Eeb70cFA05723EAE7c06805EC5', // 4pool
  ];

const AstarStableSwapContractAddress = [
    '0xb0Fa056fFFb74c0FB215F86D691c94Ed45b686Aa', // 4pool
];

function sumMultiPoolVersionTvl(poolTvls) {
    const total = {};
    poolTvls.forEach((tvlVersion) => {
        Object.entries(tvlVersion).forEach(([assetName, balance]) => {
            if(!total[assetName]) {
                total[assetName] = 0;
            }
            total[assetName] += balance;
        }); 
    });
    return total;
}

async function calcuteMoonriverTvl(timestamp, ethBlock, chainBlocks) {
    const v1Tvl = await calculateUsdTvl(
        "0xf36AE63d89983E3aeA8AaaD1086C3280eb01438D",
        "moonriver",
        "0x98878b06940ae243284ca214f92bb71a2b032b8a",
        [
            "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d", // USDC
            "0xb44a9b6905af7c801311e8f4e76932ee959c663c", // USDT
            "0xffffffffa1b026a00fbaa67c86d5d1d5bf8d8228", // xcAUSD
            "0x1a93b23281cc1cde4c4741353f3064709a16197d", // FRAX
            "0xffffffff1fcacbd218edc0eba20fc2308c778080", // xcKSM
            "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c", // ETH
        ],
        true,
        "moonriver",
        18,
        MoonriverStableSwapContractAddress,
        moonriverStablePoolTokenMap
    )(timestamp, ethBlock, chainBlocks);

    const v2Tvl = await calculateUsdTvl(
        "0x28Eaa01DC747C4e9D37c5ca473E7d167E90F8d38",
        "moonriver",
        "0x98878b06940ae243284ca214f92bb71a2b032b8a",
        [
            "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d", // USDC
            "0xb44a9b6905af7c801311e8f4e76932ee959c663c", // USDT
            "0xffffffffa1b026a00fbaa67c86d5d1d5bf8d8228", // xcAUSD
            "0x1a93b23281cc1cde4c4741353f3064709a16197d", // FRAX
            "0xffffffff1fcacbd218edc0eba20fc2308c778080", // xcKSM
            "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c", // ETH
        ],
        true,
        "moonriver",
        18,
        [],
        {}
    )(timestamp, ethBlock, chainBlocks);
    const tvlTotal = sumMultiPoolVersionTvl([
        v1Tvl,
        v2Tvl
    ]);
    return tvlTotal;
}


async function calcuteMoonbeamTvl(timestamp, ethBlock, chainBlocks) {
    const v1Tvl = await calculateUsdTvl(
        "0xF49255205Dfd7933c4D0f25A57D40B1511F92fEF",
        "moonbeam",
        "0xacc15dc74880c9944775448304b263d191c6077f",
        [
            "0x8f552a71efe5eefc207bf75485b356a0b3f01ec9", // madUSDC
            "0xc234a67a4f840e61ade794be47de455361b52413", // madDAI
            "0x8e70cd5b4ff3f62659049e74b6649c6603a0e594", //madUSDT
            "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b", // anyUSDC
            "0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73", // anyUSDT
            "0x765277eebeca2e31912c9946eae1021199b39c61", // anyDAI
            "0xffffffff52c56a9257bb97f4b2b6f7b2d624ecda", // xcAUSD
            "0x322e86852e492a7ee17f28a78c663da38fb33bfb", // FRAX
            "0x81ecac0d6be0550a00ff064a4f9dd2400585fe9c", // ceUSDT
            "0x6a2d262d56735dba19dd70682b39f6be9a931d98" // ceUSDC
        ],
        true,
        "moonbeam",
        18,
        MoonbeamStableSwapContractAddress
    )(timestamp, ethBlock, chainBlocks);

    const v2Tvl = await calculateUsdTvl(
        "0x079710316b06BBB2c0FF4bEFb7D2DaC206c716A0",
        "moonbeam",
        "0xacc15dc74880c9944775448304b263d191c6077f",
        [
            "0x8f552a71efe5eefc207bf75485b356a0b3f01ec9", // madUSDC
            "0xc234a67a4f840e61ade794be47de455361b52413", // madDAI
            "0x8e70cd5b4ff3f62659049e74b6649c6603a0e594", //madUSDT
            "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b", // anyUSDC
            "0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73", // anyUSDT
            "0x765277eebeca2e31912c9946eae1021199b39c61", // anyDAI
            "0xffffffff52c56a9257bb97f4b2b6f7b2d624ecda", // xcAUSD
            "0x322e86852e492a7ee17f28a78c663da38fb33bfb", // FRAX
            "0x81ecac0d6be0550a00ff064a4f9dd2400585fe9c", // ceUSDT
            "0x6a2d262d56735dba19dd70682b39f6be9a931d98" // ceUSDC
        ],
        true,
        "moonbeam",
        18,
        []
    )(timestamp, ethBlock, chainBlocks);
    const tvlTotal = sumMultiPoolVersionTvl([
        v1Tvl,
        v2Tvl
    ]);
    return tvlTotal;
}

module.exports = {
    methodology: "Get all pairs from the Factory Contract then get the reserve0 token amount and reserve1 token amount in one pair. Update the total balance of each token by reserve0 and reserve1. Repeat 2 ~ 3 for each pairs.",
    misrepresentedTokens: true,
    ...getExports("bifrost-dex", ['bifrost']),
    moonriver: {
        tvl: calcuteMoonriverTvl
    },
    moonbeam: {
        tvl: calcuteMoonbeamTvl
    },
    astar: {
        tvl: calculateUsdTvl(
            "0x7BAe21fB8408D534aDfeFcB46371c3576a1D5717",
            "astar",
            "0xaeaaf0e2c81af264101b9129c00f4440ccf0f720",
            [
                "0x3795c36e7d12a8c252a20c5a7b455f7c57b60283", // USDT
                "0x6a2d262d56735dba19dd70682b39f6be9a931d98", // USDC
                "0x6de33698e9e9b787e09d3bd7771ef63557e148bb", // DAI
                "0x733ebcc6df85f8266349defd0980f8ced9b45f35", // BAI
                "0x4bf769b05e832fcdc9053fffbc78ca889acb5e1e" // BUSD
            ],
            true,
            "astar",
            18,
            AstarStableSwapContractAddress
        )
    }
}
