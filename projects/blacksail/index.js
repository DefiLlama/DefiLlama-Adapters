const utils = require('../helper/utils');
const Web3 = require('web3');
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

async function getTotalLpStakedInVault(web3, strategy_address, prices, token_id) {
    try {
        const strategyContract = new web3.eth.Contract(BLACKSAIL_STRAT_ABI, strategy_address);
        const totalStaked = new BigNumber(await strategyContract.methods.balanceOf().call());
        const stakingToken = await strategyContract.methods.staking_token().call();
        const stakingTokenContract = new web3.eth.Contract(ERC20_ABI, stakingToken);
        const stakingTokenDecimals = await stakingTokenContract.methods.decimals().call();

        let tokenPrice = new BigNumber(0);
        if (token_id in prices) {
            tokenPrice = new BigNumber(prices[token_id]);
        }

        const totalStakedInUsd = totalStaked.times(tokenPrice.dividedBy(new BigNumber(10).pow(stakingTokenDecimals)));
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

        const web3 = new Web3(new Web3.providers.HttpProvider(CHAIN_DATA["146"]["chainRPC"]));

        for (const vault in yields) {
            total_tvl += getTotalLpStakedInVault(web3, yields[vault]["strat_address"], prices, yields[vault]["token_id"])
        }
        return total_tvl
    }
}

module.exports = {
    sonic: {
        tvl: fetchChain()
    }
}