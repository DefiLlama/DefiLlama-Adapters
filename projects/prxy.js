const retry = require('./helper/retry')
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('https://rpc-mainnet.maticvigil.com/v1/d8df1938ab3aecb7dd672ca671a5d5dd0b75d9d1'))
const MATIC_PRXY_ADDRESS = '0xab3D689C22a2Bb821f50A4Ff0F21A7980dCB8591'
const MATIC_STAKING_ADDRESS = '0x015CEe3aB6d03267B1B2c05D2Ac9e2250AF5268d'

const axios = require('axios');
const BigNumber = require('bignumber.js');
const totalSupply = 'https://api.btcpx.io/api/v1/prxy-staking/stats'
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
const contract = new web3.eth.Contract(abi, MATIC_PRXY_ADDRESS)

async function fetchTotalSupply() {
    const totalSupplyResponse = await retry(async bail => await axios.get(totalSupply, {
        headers: {
            'x-signature': 'f104e31bbc788b25c12ad65f4063bea9c9a731004212002f3f7c773f9d72f7a1',
            'origin': 'https://app.prxy.fi'
        }
    }))
    for(let t of totalSupplyResponse.data){
        if(t.custodian === true){
            return t.tvl
        }
    }
}
async function getStakingBalance(){
    let balance = await contract.methods.balanceOf(MATIC_STAKING_ADDRESS).call()
    balance = web3.utils.fromWei(balance, 'ether')
    return balance
}
async function getPrxyLivePrice(){
    let res = await axios.post('https://polygon.furadao.org/subgraphs/name/quickswap', {
        "operationName": "tokenData",
        "variables": {
            "tokenAddr": "0xab3d689c22a2bb821f50a4ff0f21a7980dcb8591",
            "skip": 0
        },
        "query": "query tokenDayDatas($tokenAddr: String!, $skip: Int!) {\n  tokenDayDatas(first: 1, skip: $skip, orderBy: date, orderDirection: desc, where: {token: $tokenAddr}) {\n    id\n    date\n    priceUSD\n    totalLiquidityToken\n    totalLiquidityUSD\n    totalLiquidityETH\n    dailyVolumeETH\n    dailyVolumeToken\n    dailyVolumeUSD\n    __typename\n  }\n}\n"
    });
    return res.data.data.tokenDayDatas[0].priceUSD
}
async function balance(){
    const totalBalance = await fetchTotalSupply()
    const stakingBalance = await getStakingBalance()
    const prxyPriceUsd = await getPrxyLivePrice()
    const finalStakingUSDBalance = new BigNumber(BigNumber(BigNumber(stakingBalance).multipliedBy(prxyPriceUsd)).toFixed(8)).toNumber()
    return new BigNumber(BigNumber(BigNumber(totalBalance).plus(finalStakingUSDBalance)).toFixed(8)).toNumber()
}

module.exports = {
    Polygon:{
        balance: balance
    },
    methodology: `BTC Proxy offers a unique institutional-grade wrapped Bitcoin solution that leverages Polygon technology to bring Bitcoin to DeFi 2.0 with no gas and no slippage and insured custody. BTC Proxy features (3,3) Staking and Bonding via the PRXY Governance token`
}
