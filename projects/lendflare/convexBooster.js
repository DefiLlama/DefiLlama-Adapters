const sdk = require('@defillama/sdk');
const BN = require("bignumber.js");

const CONVEX_BOOSTER_PROXY = `0x4C3c78cEbc9Cc87436dEEd2782998bC002F2B69f`;

const convexPools = {
    // 3pool
    1: { lpToken: "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490", virtualBalance: "0x51CeC58171863ea82cE3B99A190f3843FE7AAbF5", coinId: 2, coinName: "tether", decimals: 6 },
    // sbtc
    2: { lpToken: "0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3", virtualBalance: "0x85b7cc4Fd8767651c752D9ea76fC7dd388e391a0", coinId: 1, coinName: "wrapped-bitcoin", decimals: 8 },
    // ren
    3: { lpToken: "0x49849C98ae39Fff122806C06791Fa73784FB3675", virtualBalance: "0x2D3a0EcA75C429b00627af759a14223c34bF910F", coinId: 1, coinName: "wrapped-bitcoin", decimals: 8 },
    // hbtc
    4: { lpToken: "0xb19059ebb43466C323583928285a49f558E572Fd", virtualBalance: "0x99b496D54848f2a98C4aA0B934f23B0f5c298E31", coinId: 1, coinName: "wrapped-bitcoin", decimals: 8 },
    // seth
    5: { lpToken: "0xA3D87FffcE63B53E0d54fAa1cc983B7eB0b74A9c", virtualBalance: "0x247b24e945d604C896165cCb2F15e190560f2133", coinId: 0, coinName: "ethereum", decimals: 18 },
    // steth
    6: { lpToken: "0x06325440D014e39736583c165C2963BA99fAf14E", virtualBalance: "0xc0E4F5758E218762960bca9706fC7b6Cf337E3c2", coinId: 0, coinName: "ethereum", decimals: 18 },
    // ankreth
    7: { lpToken: "0xaA17A236F2bAdc98DDc0Cf999AbB47D47Fc0A6Cf", virtualBalance: "0x86CA9713762c04E10d2E2057952B91917DC650f2", coinId: 0, coinName: "ethereum", decimals: 18 },
    // reth
    8: { lpToken: "0x53a901d48795C58f485cBB38df08FA96a24669D5", virtualBalance: "0xCCBc7Fcc994Db1D8F5FFF17104532c0e0E78b449", coinId: 0, coinName: "ethereum", decimals: 18 },
    // susd
    9: { lpToken: "0xC25a3A3b969415c80451098fa907EC722572917F", virtualBalance: "0x518802D8764c2823610a619bE95BF089AA121BA5", coinId: 2, coinName: "tether", decimals: 6 },
    // mim
    10: { lpToken: "0x5a6A4D54456819380173272A5E8E9B9904BdF41B", virtualBalance: "0xa91d85B2E9fE1F0371559a9a7DcB1BbE1AcF9587", coinId: 3, coinName: "tether", decimals: 6 },
    // frax
    11: { lpToken: "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B", virtualBalance: "0x86b26838f03C3724cB9a9D4d165df052c401a257", coinId: 3, coinName: "tether", decimals: 6 },
    // musd
    12: { lpToken: "0x1AEf73d49Dedc4b1778d0706583995958Dc862e6", virtualBalance: "0xEAE58fd59225A192eD897C3C8B382727dc322335", coinId: 3, coinName: "tether", decimals: 6 },
    // ust
    13: { lpToken: "0x94e131324b6054c0D789b190b2dAC504e4361b53", virtualBalance: "0x8856738191DcF0B582e491beA99e880aB734F4e6", coinId: 3, coinName: "tether", decimals: 6 },
    // lusd
    14: { lpToken: "0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA", virtualBalance: "0x2Cb79C6BB40346A08ad7A7baf65a8b4315876E26", coinId: 3, coinName: "tether", decimals: 6 },
    // alUSD
    15: { lpToken: "0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c", virtualBalance: "0x6F114A680915b3335c65225b7f61e2021419b24B", coinId: 3, coinName: "tether", decimals: 6 },
    // gusd
    16: { lpToken: "0xD2967f45c4f384DEEa880F807Be904762a3DeA07", virtualBalance: "0x0e44e003cA8B7A2dD0742286FC1a3FaD754a5450", coinId: 3, coinName: "tether", decimals: 6 },
    // usdn
    17: { lpToken: "0x4f3E8F405CF5aFC05D68142F3783bDfE13811522", virtualBalance: "0xa16D36ea387AEE0f625425ADa2540D1A95Dc2440", coinId: 3, coinName: "tether", decimals: 6 },
    // usdk
    18: { lpToken: "0x97E2768e8E73511cA874545DC5Ff8067eB19B787", virtualBalance: "0x83Ec519B6121eA1B6ae05177e7e9f9c046A5Fe20", coinId: 3, coinName: "tether", decimals: 6 },
    // busd
    19: { lpToken: "0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a", virtualBalance: "0x8f48eB0d8C298abbc68Be5deCe86c6fAa4e33497", coinId: 3, coinName: "tether", decimals: 6 },
    // husd
    20: { lpToken: "0x5B5CFE992AdAC0C9D48E05854B2d91C73a003858", virtualBalance: "0x7fB09845695F6Bd88f4A0752e6a539a2209B6707", coinId: 3, coinName: "tether", decimals: 6 },
    // rsv
    21: { lpToken: "0xC2Ee6b0334C261ED60C72f6054450b61B8f18E35", virtualBalance: "0x83d6e9bA460130D82194620Ca0b16D025064d139", coinId: 3, coinName: "tether", decimals: 6 },
    // dusd
    22: { lpToken: "0x3a664Ab939FD8482048609f652f9a0B0677337B9", virtualBalance: "0x7538345c421467a2A58Cbe9FA3DfbDEb6Fb2C15a", coinId: 3, coinName: "tether", decimals: 6 },
    // usdp
    23: { lpToken: "0x7Eb40E450b9655f4B3cC4259BCC731c63ff55ae6", virtualBalance: "0xd8252a4EC16de33fAd1C69f2d3E80E9F7b8ceF12", coinId: 3, coinName: "tether", decimals: 6 },
    // obtc
    24: { lpToken: "0x2fE94ea3d5d4a175184081439753DE15AeF9d614", virtualBalance: "0x47A2eec0D7502Ba1FEc0cAe0eeafF64DCf28af60", coinId: 2, coinName: "wrapped-bitcoin", decimals: 8 },
    // bbtc
    25: { lpToken: "0x410e3E86ef427e30B9235497143881f717d93c2A", virtualBalance: "0xE1C0b5302E5a627141746ACB1025c43f9FE87ca8", coinId: 2, coinName: "wrapped-bitcoin", decimals: 8 },
    // tbtc
    26: { lpToken: "0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd", virtualBalance: "0x1ACc3ffb27c31C541695Ff75b21569CfaeDCA877", coinId: 2, coinName: "wrapped-bitcoin", decimals: 8 },
    // pbtc
    27: { lpToken: "0xDE5331AC4B3630f94853Ff322B66407e0D6331E8", virtualBalance: "0x0D66b49A68AffdDcDaDDdfE06CD6369307B2BA46", coinId: 2, coinName: "wrapped-bitcoin", decimals: 8 }
}

async function getTotalSupply(pools, chainBlocks) {
    const output = (await sdk.api.abi.multiCall({
        block: chainBlocks.ethereum,
        chain: "ethereum",
        abi: 'erc20:totalSupply',
        calls: Object.keys(pools).map((pid, _) => {
            return {
                target: pools[pid].virtualBalance
            }
        })
    })).output.map((result, i) => {
        for (let pid of Object.keys(pools)) {
            if (pools[pid].virtualBalance == result.input.target) {
                pools[pid].totalSupply = (new BN(result.output));
                pools[pid].totalSupplyString = result.output;
            }
        }
    });

    return pools;
}

async function calculateTokenAmount(pools, chainBlocks) {
    for (let pid of Object.keys(pools)) {
        await sdk.api.abi.call({
            block: chainBlocks.ethereum,
            chain: "ethereum",
            abi: 'function calculateTokenAmount(uint256 _pid, uint256 _tokens, int128 _curveCoinId) view returns (uint256)',
            target: CONVEX_BOOSTER_PROXY,
            params: [pid, pools[pid].totalSupplyString, pools[pid].coinId]
        }).then(result => {
            pools[pid].calculateTokenAmount = new BN(result.output);
        }).catch(error => {
            pools[pid].calculateTokenAmount = new BN(0);
        });
    }

    return pools;
}

async function tvl(timestamp, block, chainBlocks) {
    const balances = {}
    const pools = await getTotalSupply(convexPools, chainBlocks).then(pools => {
        return calculateTokenAmount(pools, chainBlocks);
    });
    Object.keys(pools).map((pid, _) => {
        if (convexPools[pid].calculateTokenAmount.isGreaterThan(new BN(0))) {
            convexPools[pid].calculateTokenAmount = convexPools[pid].calculateTokenAmount.dividedBy(10 ** convexPools[pid].decimals);
        }
        sdk.util.sumSingleBalance(balances, convexPools[pid].coinName, +convexPools[pid].calculateTokenAmount)
    });
    return balances;
}

module.exports = {
    tvl
};
