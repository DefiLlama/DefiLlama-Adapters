const utils = require('../helper/utils');
const ethers = require("ethers");
const BigNumber = require('bignumber.js');
let _response;

const CHAIN_DATA = {
    "146": {
        "chainFriendlyName": "Sonic",
        "chainRPC": "https://rpc.soniclabs.com/",
    }
}

const BLACKSAIL_STRAT_ABI = [
    {
        "inputs": [],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "staking_token",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

const ERC20_ABI = [
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

async function getTotalLpStakedInVault(provider, strategy_address, prices, token_id) {
    try {
        const strategyContract = new ethers.Contract(strategy_address, BLACKSAIL_STRAT_ABI, provider);
        const totalStaked = await strategyContract.balanceOf();
        const stakingToken = await strategyContract.staking_token();
        const stakingTokenContract = new ethers.Contract(stakingToken, ERC20_ABI, provider);
        const stakingTokenDecimals = await stakingTokenContract.decimals();

        let tokenPrice = new BigNumber(0);
        if (token_id in prices) {
            tokenPrice = new BigNumber(prices[token_id]);
        }

        const totalStakedInUsd = new BigNumber(totalStaked.toString()).times(tokenPrice.dividedBy(new BigNumber(10).pow(stakingTokenDecimals)));
        return totalStakedInUsd;
    } catch (error) {
        console.error("Error in Blacksail getTotalLpStakedInVault: ", error);
        return new BigNumber(0);
    }
}


async function fetchChain() {
    return async () => {
        if (!_response) _response = utils.fetchURL('https://api.blacksail.finance/stats')
        const response = await _response;

        let total_tvl = 0;
        let yields = response["data"]["yield"]
        let prices = response["data"]["price"]

        const provider = new ethers.JsonRpcProvider(CHAIN_DATA["146"]["chainRPC"]);

        for (const vault in yields) {
            total_tvl += await getTotalLpStakedInVault(provider, yields[vault]["strat_address"], prices, yields[vault]["token_id"]);
        }
        return total_tvl;
    }
}

module.exports = {
    sonic: {
        tvl: fetchChain()
    }
}