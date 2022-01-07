const Web3 = require('web3')
const retryModule = require('async-retry')
const axios = require('axios');
const BN = require('bignumber.js');
const MATIC_PRXY_ADDRESS = '0xab3D689C22a2Bb821f50A4Ff0F21A7980dCB8591'
const MATIC_STAKING_ADDRESS = '0x015CEe3aB6d03267B1B2c05D2Ac9e2250AF5268d'

const retry = (func) => {
    return retryModule(func, {
        retries: 3
    })
}

const abi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
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
    }

]
const stakingAbi = [
    {
        "inputs": [],
        "name": "getTVLInUsd",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

let web3;
let contract;

async function getPrxyLivePrice() {
    let getPrice = await retry(async bail => await axios.post('https://polygon.furadao.org/subgraphs/name/quickswap', {
        "operationName": "tokenData",
        "variables": {
            "tokenAddr": "0xab3d689c22a2bb821f50a4ff0f21a7980dcb8591",
            "skip": 0
        },
        "query": "query tokenDayDatas($tokenAddr: String!, $skip: Int!) {\n  tokenDayDatas(first: 1, skip: $skip, orderBy: date, orderDirection: desc, where: {token: $tokenAddr}) {\n    id\n    date\n    priceUSD\n    totalLiquidityToken\n    totalLiquidityUSD\n    totalLiquidityETH\n    dailyVolumeETH\n    dailyVolumeToken\n    dailyVolumeUSD\n    __typename\n  }\n}\n"
    }))
    return getPrice.data.data.tokenDayDatas[0].priceUSD
}

async function getStakingBalance() {
    web3 = new Web3(new Web3.providers.HttpProvider('https://rpc-mainnet.maticvigil.com/v1/d8df1938ab3aecb7dd672ca671a5d5dd0b75d9d1'))
    const contract = new web3.eth.Contract(abi, MATIC_PRXY_ADDRESS)

    let balance = await contract.methods.balanceOf(MATIC_STAKING_ADDRESS).call()
    balance = web3.utils.fromWei(balance, 'ether')
    return Number(balance)
}

const programsList = 'https://api.btcpx.io/api/v1/prxy-staking/list/0/10'

async function programs() {
    const programList = await retry(async bail => await axios.get(programsList, {
        headers: {
            'x-signature': 'f104e31bbc788b25c12ad65f4063bea9c9a731004212002f3f7c773f9d72f7a1',
            'origin': 'https://app.prxy.fi'
        }
    }))
    return programList.data.txs
}

const polygon = async () => {
    const polygonBalance = []
    const result = await programs()
    for (let r of result) {
        if (r.chain.toLowerCase() === 'polygon') {
            web3 = new Web3(new Web3.providers.HttpProvider('https://rpc-mainnet.maticvigil.com/v1/d8df1938ab3aecb7dd672ca671a5d5dd0b75d9d1'))
            contract = new web3.eth.Contract(stakingAbi, r.stakingContractAddress)
            let tvl = await contract.methods.getTVLInUsd().call()
            tvl = new BN(BN(BN(tvl).dividedBy(1e6)).toFixed(8)).toNumber()
            polygonBalance.push(tvl)
        }
    }
    const prxyUsdValue = await getPrxyLivePrice()
    const stakingValue = await getStakingBalance()
    const stakingBalance = new BN(BN(BN(stakingValue).multipliedBy(prxyUsdValue)).toFixed(8)).toNumber()
    polygonBalance.push(stakingBalance)
    return polygonBalance.reduce((acc, val) => {
        return acc + val;
    }, 0)
}

const ethereum = async () => {
    const eth = []
    const result = await programs()
    for (let r of result) {
        if (r.chain.toLowerCase() === 'ethereum') {
            web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/7e128d130b4e49fb866ebdc691125524'))
            contract = new web3.eth.Contract(stakingAbi, r.stakingContractAddress)
            let tvl = await contract.methods.getTVLInUsd().call()
            tvl = new BN(BN(BN(tvl).dividedBy(1e6)).toFixed(8)).toNumber()
            eth.push({tvl: tvl})
        }
    }
    return eth[0].tvl
}

module.exports = {
    polygon: {
        polygon: polygon
    },
    ethereum: {
        ethereum: ethereum
    },
    methodology: `BTC Proxy offers a unique institutional-grade wrapped Bitcoin solution that leverages Polygon technology to bring Bitcoin to DeFi 2.0 with no gas and no slippage and insured custody. BTC Proxy features (3,3) Staking and Bonding via the PRXY Governance token`
}
