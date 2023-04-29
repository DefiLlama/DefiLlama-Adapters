const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs, sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

// HUNNY FINANCE
const hunnyToken = "0x565b72163f17849832a692a3c5928cc502f46d69";

// POOL2 TOKEN
const hunnybnblpstaking = "0x434Af79fd4E96B5985719e3F5f766619DC185EAe";
const hunnybnblp = "0x36118142F8C21a1F3fd806D4A34F56f51F33504F";

// STAKING 
const stakingContracts = [
    "0x8B2cf8CF0A30082111FB50D9a8FEBfe53C155B50", // AUTO HUNNY HIVE
    "0x24320c20499535d0D7a8F6adFb08e5E3f5694417", // HUNNY ACE HIVE
    "0x389D2719a9Bcc29583Db89FD9454ADe9e57CD18d" // RETIRED HUNNY HIVE
]
    
const farmContracts = [
    // Auto Compounding FARM Contracts
    "0x848391a2509646cD380fca7f9c740E6F3B6e516F", // CAKE
    "0x76Bd85dA85aA07c6f8565DE0d882356083f37115", // BNB
    "0x7969EF7B7D6f79a798e85367C5824B835C2D644F", // BABY
    "0x9e84a8f7043601a2Ca497c5cF700FF5E099B55DD", // BUSD
    "0xf78b82BFA4596c6862720E3e13E6eaA24B74e4f8", // USDT
    "0x8d58AF27477Aa9B0F79A0F7825689Af015BaC8F2", // BTCB
    "0xeAC4584f446eb608CCd9C173B84a1E277db62C9B", // ETH
    "0xb7D43F1beD47eCba4Ad69CcD56dde4474B599965", // CAKE
    "0xAD4134F59C5241d0B4f6189731AA2f7b279D4104", // BANANA
    "0xc212ba7Dec34308A4cb380612830263387150310", // USDC (Venus)
    "0xBcCfD3e2Af166bB28B6b4Dfd6C1BF1F3f7F47632", // USDT (Venus)
    "0xe763D7E9a14ADB928766C19DF4bcE580fb6393B3", // BUSD (Venus)
    // Booster HIVE Contracts 
    "0x65003459BF2506B096a9a9C8bC691e88430567D1", // BANANA-BNB
    "0xBDb18B0C2fC2dD0DeD494F43c4101E8D23Fb596E", // CAKE-BNB
    // Retired HIVE contracts
    "0x12180BB36DdBce325b3be0c087d61Fce39b8f5A4", // CAKE-BNB
    "0xD87F461a52E2eB9E57463B9A4E0e97c7026A5DCB", // BUSD-BNB
    "0x31972E7bfAaeE72F2EB3a7F68Ff71D0C61162e81", // USDT-BNB
    "0x3B34AA6825fA731c69C63d4925d7a2E3F6c7f13C", // DOGE-BNB
    "0x2ea6676c106e200Eef203331d794c7B4A01CaAB5", // FIL
    "0xef43313e8218f25Fe63D5ae76D98182D7A4797CC", // TUSD
    "0xdFe440fBe839E9D722F3d1c28773850F99692c76", // BUNNY-BNB
    "0xF0D4a0398D6D48B958d0777528D0eE9A24Fb8899", // DOGE-BNB
    "0x6c7eFFa3d0694f8fc2D6aEe501ff484c1FE6fcD2", // LINK-BNB
    "0x4C8714d28Bf187E4B0aC47B880334090500dAFD4", // USDT-BNB
    "0xf36e82E42670DB17f08C9731a45689D9190fB8AC" // BUSD-BNB
];

// HUNNY DAO
const love = "0x9505dbD77DaCD1F6C89F101b98522D4b871d88C5";
const dao = "0x650eC6f59b64AcAC97A33C1F2F34c646659FF8b4"
const loveStaking = "0x31dd9Be51cC7A96359cAaE6Cb4f5583C89D81985"
const treasury = "0x631Fb1f772b8A20e775D1d4F3F87BfCaBA317527";
const treasuryTokens = [
	[ADDRESSES.bsc.BUSD, false], // BUSD
	["0x9e8Ae3a26536582823Ef82c155B69637a4A753F8", true], // LOVE-BUSD Cake-LP
	[ADDRESSES.bsc.USDT, false], // USDT
	[ADDRESSES.bsc.WBNB, false], // WBNB
	["0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", false], // CAKE
	["0x565b72163f17849832a692a3c5928cc502f46d69", false], // HUNNY
]

const chain = "bsc";

async function tvl (timestamp, block, chainBlocks) {
    block = chainBlocks.bsc;
    let balances = {};

    // HUNNY FINANCE
    const stakingTokens = (await sdk.api.abi.multiCall({
        calls: farmContracts.map( p => ({
            target: p
        })),
        abi: abi.stakingToken,
        block,
        chain
    })).output;
    const symbols = (await sdk.api.abi.multiCall({
        calls: stakingTokens.map( p => ({
            target: p.output
        })),
        abi: "erc20:symbol",
        block,
        chain
    })).output;
    const stakingBalances = (await sdk.api.abi.multiCall({
        calls: farmContracts.map( p => ({
            target: p
        })),
        abi: abi.balance,
        block,
        chain
    })).output;
    let lpPositions = [];
    for (let i = 0; i < farmContracts.length; i++) {
        if (symbols[i].output.endsWith("LP")) {
            lpPositions.push({
                token: stakingTokens[i].output,
                balance: stakingBalances[i].output
            });
        } else {
            sdk.util.sumSingleBalance(balances, `bsc:${stakingTokens[i].output}`, stakingBalances[i].output);
        }
    }
    await unwrapUniswapLPs(balances, lpPositions, block, chain, addr=>`bsc:${addr}`);

    // HUNNY DAO TVL

    // await sumTokensAndLPsSharedOwners(
	// 	balances,
	// 	treasuryTokens,
	// 	[treasury],
	// 	chainBlocks.bsc,
	// 	'bsc',
	// 	addr=>`bsc:${addr}`
	// );

    return balances;
    
}

async function staking (timestamp, block, chainBlocks) {
    let balances = {};
    block = chainBlocks.bsc;
    // HUNNY FINANCE STAKING
    const stakingBalances = (await sdk.api.abi.multiCall({
        calls: stakingContracts.map( p => ({
            target: p
        })),
        abi: abi.balance,
        block,
        chain
    })).output;
    stakingBalances.forEach(p => {
        sdk.util.sumSingleBalance(balances, `bsc:${hunnyToken}`, p.output);
    });

    // HUNNY DAO STAKING
    // const daoStakeBalance = (await sdk.api.erc20.balanceOf({
    //     target: love,
    //     owner: loveStaking,
    //     block,
    //     chain
    // })).output;
    // sdk.util.sumSingleBalance(balances, `bsc:${love}`, daoStakeBalance);
    return balances;
}

async function pool2 (timestamp, block, chainBlocks) {
    let balances = {};
    block = chainBlocks.bsc;
    const balance = ( await sdk.api.abi.call({
        target: hunnybnblpstaking,
        abi: abi.balance,
        block,
        chain
    })).output;
    await unwrapUniswapLPs(balances, [{balance, token: hunnybnblp}], block, chain, addr=>`bsc:${addr}`);
    return balances;
}

module.exports = {
    methodology: "TVL is from the pools on Hunny Finance and tokens locked in Hunny DAO treasury",
    bsc: {
        tvl,
        staking,
        pool2
    }
}