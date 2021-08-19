const sdk = require('@defillama/sdk');

const formalDeposit = {
    "coins": {
        "name": "coins",
        "outputs": [{ "type": "address", "name": "out" }],
        "inputs": [{ "type": "int128", "name": "arg0" }],
        "constant": true,
        "payable": false,
        "type": "function",
        "gas": 1680
    },
    "curve": {
        "name": "curve",
        "outputs": [{ "type": "address", "name": "out" }],
        "inputs": [],
        "constant": true,
        "payable": false,
        "type": "function",
        "gas": 1541
    },
    "underlying_coins": {
        "name": "underlying_coins",
        "outputs": [{ "type": "address", "name": "out" }],
        "inputs": [{ "type": "int128", "name": "arg0" }],
        "constant": true,
        "payable": false,
        "type": "function",
        "gas": 1710
    }
};
const formalSwapPool = {
    "balances": {
        "name": "balances",
        "outputs": [{ "type": "uint256", "name": "out" }],
        "inputs": [{ "type": "int128", "name": "arg0" }],
        "constant": true,
        "payable": false,
        "type": "function",
        "gas": 2430
    }
};
const erc20 = {
    "decimals": {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
};
const cToken = {
    "exchangeRateStored": {
        "constant": true,
        "inputs": [],
        "name": "exchangeRateStored",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
};
const mdexRouter = {
    "getAmountsOut": {
        "inputs": [{
            "internalType": "uint256",
            "name": "amountIn",
            "type": "uint256"
        }, { "internalType": "address[]", "name": "path", "type": "address[]" }],
        "name": "getAmountsOut",
        "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
        "stateMutability": "view",
        "type": "function"
    },
    "getAmountsIn": {
        "inputs": [{
            "internalType": "uint256",
            "name": "amountOut",
            "type": "uint256"
        }, { "internalType": "address[]", "name": "path", "type": "address[]" }],
        "name": "getAmountsIn",
        "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
        "stateMutability": "view",
        "type": "function"
    }
};

const vaultAbi = {
    "getSelfUnderlying":{"inputs":[],"name":"getSelfUnderlying","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    "balance":{"inputs":[],"name":"balance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
}
const daoAbi={"sharesAndRewardsInfo":{"inputs":[],"name":"sharesAndRewardsInfo","outputs":[{"internalType":"uint256","name":"activeShares","type":"uint256"},{"internalType":"uint256","name":"pendingSharesToAdd","type":"uint256"},{"internalType":"uint256","name":"pendingSharesToReduce","type":"uint256"},{"internalType":"uint256","name":"rewards","type":"uint256"},{"internalType":"uint256","name":"claimedRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdatedEpochFlag","type":"uint256"}],"stateMutability":"view","type":"function"}}

const swapPoolAbiV2 ={
    "balances":{"name":"balances","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256","name":"arg0"}],"stateMutability":"view","type":"function","gas":2220},
    "coins":{"name":"coins","outputs":[{"type":"address","name":""}],"inputs":[{"type":"uint256","name":"arg0"}],"stateMutability":"view","type":"function","gas":2190}
}

const channels = '0x11bFEE9D8625ac4cDa6Ce52EeBF5caC7DC033d15';
const filda = '0xE796c55d6af868D8c5E4A92e4fbCF8D8F88AcDED';
const lendhub = '0xdA0519AA3F097A3A5b1325cb1D380C765d8F1D70';
const lendhubeth = '0x15155042F8d13Db274224AF4530397f640f69274';

const fildaSwapV2Address="0xa7a0EA0C5D2257e44Ad87d10DB90158c9c5c54b3"

const vaultGroup=[
    {
        "IsHUSD": false,
        "Vaults": [
            {
                "Name": "Filda",
                "ContractAddress": "0x6FF92A0e4dA9432a79748A15c5B8eCeE6CF0eE66",
                "TokenName": "dfUSDT"
            },
            {
                "Name": "Channels",
                "ContractAddress": "0x95c258E41f5d204426C33628928b7Cc10FfcF866",
                "TokenName": "dcUSDT"
            },
            {
                "Name": "Lendhub",
                "ContractAddress": "0x70941A63D4E24684Bd746432123Da1fE0bFA1A35",
                "TokenName": "dlUSDT"
            },
            {
                "Name": "Back",
                "ContractAddress": "0x22BAd7190D3585F6be4B9fCed192E9343ec9d5c7",
                "TokenName": "dbUSDT"
            },
            {
                "Name": "Pilot",
                "ContractAddress": "0xB567bd78A4Ef08EE9C08762716B1699C46bA5ea3",
                "TokenName": "plUSDT"
            },
            {
                "Name": "CoinWind",
                "ContractAddress": "0xd96e3FeDbF4640063F2B20Bd7B646fFbe3c774FF",
                "TokenName": "cwUSDT"
            }
        ]
    },
    {
        "IsHUSD": true,
        "Vaults": [
            {
                "Name": "Lendhub",
                "ContractAddress": "0x80Da2161a80f50fea78BE73044E39fE5361aC0dC",
                "TokenName": "dlHUSD"
            },
            {
                "Name": "Filda",
                "ContractAddress": "0xE308880c215246Fa78753DE7756F9fc814D1C186",
                "TokenName": "dfHUSD"
            },
            {
                "Name": "Channels",
                "ContractAddress": "0x9213c6269Faed1dE6102A198d05a6f9E9D70e1D0",
                "TokenName": "dcHUSD"
            },
            {
                "Name": "Back",
                "ContractAddress": "0x996a0e31508E93EB53fd27d216E111fB08E22255",
                "TokenName": "dbHUSD"
            },
            {
                "Name": "Pilot",
                "ContractAddress": "0x9bd25Ed64F55f317d0404CCD063631CbfC4fc90b",
                "TokenName": "plHUSD"
            },
            {
                "Name": "CoinWind",
                "ContractAddress": "0x7e1Ac905214214c1E339aaFBA72E2Ce29a7bEC22",
                "TokenName": "cwHUSD"
            }
        ]
    }
]
async function exchangeRateStored(depositContractAddress, coinId) {
    const coinAddress = await sdk.api.abi.call({
        target: depositContractAddress,
        abi: formalDeposit['coins'],
        chain: "heco",
        params: coinId,
    });
    const rate = await sdk.api.abi.call({
        target: coinAddress.output,
        abi: cToken['exchangeRateStored'],
        chain: 'heco',
    });
    return rate.output
}

async function getBalance(contractAddress, coinId) {
    const swapContract = await sdk.api.abi.call({
        target: contractAddress,
        abi: formalDeposit['curve'],
        chain: "heco",
    });
    const balance = await sdk.api.abi.call({
        target: swapContract.output,
        abi: formalSwapPool['balances'],
        chain: "heco",
        params: coinId,

    });
    return balance.output
}

async function getDecimals(contractAddress, coinId) {
    const underlyingCoinsAddress = await sdk.api.abi.call({
        target: contractAddress,
        abi: formalDeposit['underlying_coins'],
        chain: "heco",
        params: coinId,
    });
    const decimals = await sdk.api.abi.call({
        target: underlyingCoinsAddress.output,
        abi: erc20['decimals'],
        chain: "heco",
    });
    return decimals.output
}

async function swapV2GetBalance(contractAddress, coinId) {
    const balance = await sdk.api.abi.call({
        target: contractAddress,
        abi: swapPoolAbiV2['balances'],
        chain: "heco",
        params: coinId,

    });
    return balance.output
}

async function swapV2GetDecimals(contractAddress, coinId) {
    const underlyingCoinsAddress = await sdk.api.abi.call({
        target: contractAddress,
        abi: swapPoolAbiV2['coins'],
        chain: "heco",
        params: coinId,
    });
    const decimals = await sdk.api.abi.call({
        target: underlyingCoinsAddress.output,
        abi: erc20['decimals'],
        chain: "heco",
    });
    return decimals.output
}
async function getTokenPrice(contractAddress) {
    const underlyingCoinsAddress = await sdk.api.abi.call({
        target: contractAddress,
        abi: formalDeposit['underlying_coins'],
        chain: "heco",
        params: 0,
    });

    const getAmountsIn = await sdk.api.abi.call({
        target: "0xED7d5F38C79115ca12fe6C0041abb22F0A06C300",
        abi: mdexRouter['getAmountsIn'],
        chain: "heco",
        params: [1e8, ['0xa71edc38d189767582c38a3145b5873052c3e47a', underlyingCoinsAddress.output]],
    });

    return getAmountsIn.output[0] / Math.pow(10, 26 - 18)
}

async function poolUnderlyingCoinBalance(contractAddress, coinId) {
    const rate = await exchangeRateStored(contractAddress, coinId)
    const balance = await getBalance(contractAddress, coinId)
    const decimals = await getDecimals(contractAddress, coinId)
    const tvlPool = rate * balance / 1e18 / Math.pow(10, decimals)
    return tvlPool
}
async function swapV2PoolUnderlyingCoinBalance(contractAddress, coinId) {
    const balance = await swapV2GetBalance(contractAddress, coinId)
    const decimals = await swapV2GetDecimals(contractAddress, coinId)
    const tvlPool =  balance  / Math.pow(10, decimals)
    return tvlPool
}

/*
	dc18 := decimal.NewFromFloat(1e18)
	dc8 := decimal.NewFromFloat(1e8)
	activeShares := decimal.NewFromBigInt(out.ActiveShares, 0).Div(dc18)
	pendingSharesToAdd := decimal.NewFromBigInt(out.PendingSharesToAdd, 0).Div(dc18)
	pendingSharesToReduce := decimal.NewFromBigInt(out.PendingSharesToReduce, 0).Div(dc18)
	rewards := decimal.NewFromBigInt(out.Rewards, 0).Div(dc8)
	return activeShares, pendingSharesToAdd, pendingSharesToReduce, rewards, nil
 */

async function getPrice(contractAddress,dc) {

    const getAmountsIn = await sdk.api.abi.call({
        target: "0xED7d5F38C79115ca12fe6C0041abb22F0A06C300",
        abi: mdexRouter['getAmountsOut'],
        chain: "heco",
        params: [1e8, [contractAddress,'0xa71edc38d189767582c38a3145b5873052c3e47a']],
    });

    return getAmountsIn.output[1] / Math.pow(10, 26 - dc)
}


async function getDaoSharesAndRewards() {
    const out= await sdk.api.abi.call({
        target: "0xfbac8c66d9b7461eefa7d8601568887c7b6f96ad",
        abi: daoAbi['sharesAndRewardsInfo'],
        chain: "heco",
    });
    const price=await getPrice("0x48C859531254F25e57D1C1A8E030Ef0B1c895c27",18)
    let dao=out.output.activeShares/ Math.pow(10, 18)+out.output.pendingSharesToAdd/ Math.pow(10, 18)-out.output.pendingSharesToReduce/ Math.pow(10, 18)
    return dao*price
}

async function getVaultTotalDeposit(){
    let totalSelfUnderlying=0
    for(let i=0;i<vaultGroup.length;i++){
        for(let j=0;j<vaultGroup[i].Vaults.length;j++) {
            const out= await sdk.api.abi.call({
                target: vaultGroup[i].Vaults[j].ContractAddress,
                abi: vaultAbi['balance'],
                chain: "heco",
            });
            if(vaultGroup[i].IsHUSD){
                totalSelfUnderlying= totalSelfUnderlying+out.output/ Math.pow(10, 8)
            }else{
                totalSelfUnderlying= totalSelfUnderlying+out.output/ Math.pow(10, 18)
            }

        }

    }
    return totalSelfUnderlying
}

async function fetch() {

    let balances = {};

    const channelsBalances1 = await poolUnderlyingCoinBalance(channels, 0)
    const channelsBalances2 = await poolUnderlyingCoinBalance(channels, 1)
    const fildaBalances1 = await poolUnderlyingCoinBalance(filda, 0)
    const fildaBalances2 = await poolUnderlyingCoinBalance(filda, 1)
    const lendhubBalances1 = await poolUnderlyingCoinBalance(lendhub, 0)
    const lendhubBalances2 = await poolUnderlyingCoinBalance(lendhub, 1)
    const lendhubethBalances1 = await poolUnderlyingCoinBalance(lendhubeth, 0)
    const lendhubethBalances2 = await poolUnderlyingCoinBalance(lendhubeth, 1)
    const price = await getTokenPrice(lendhubeth)

    const fildaSwapV2Balances1 = await swapV2PoolUnderlyingCoinBalance(fildaSwapV2Address, 0)
    const fildaSwapV2Balances2 = await swapV2PoolUnderlyingCoinBalance(fildaSwapV2Address, 1)

    balances[channels] = channelsBalances1 + channelsBalances2;
    balances[filda] = fildaBalances1 + fildaBalances2;
    balances[lendhub] = lendhubBalances1 + lendhubBalances2;
    balances[lendhubeth] = (lendhubethBalances1 + lendhubethBalances2) * price;

    balances[fildaSwapV2Address] = fildaSwapV2Balances1 + fildaSwapV2Balances2;

    let total = 0
    for (var key in balances) {
        total += balances[key];
    }
    let dao=await getDaoSharesAndRewards()
    let vault=await getVaultTotalDeposit()
 

    return total+dao+vault
}



module.exports = {
    name: 'Depth',
    website: 'https://depth.fi/',
    token: 'DEP',
    category: 'lending',
    start: 1602054167,
    fetch
}
