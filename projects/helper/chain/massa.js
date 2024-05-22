
const sdk = require('@defillama/sdk')
const http = require('../http')

const RPC_ENDPOINT = 'grpc://mainnet.massa.net:33037'


// 1. fetch all the pools of the factory adress
// function that retuns the list of pools with the factory address
//get the list of pools AddressDatastoreKeysFinal
async function fetchList(factory){
    const pools = await http.get(`${RPC_ENDPOINT}/massa/api/v1/public.proto/AddressDatastoreKeysFinal?address=${factory}`)

    //after the pools are fetched, print out the pools 
    console.log('pools',pools)
    return pools; 
}

// TODO - either 2 or 3 
// 2. fetch all the tokenX and tokenY of the pools
// 3. function that calls the pools and fetch the tokenX or tokenY of the pool lists 
async function multicall({abis, calls}){}


// 4. function that sums the token balances of the all the tokenX and tokenY of all pools 
async function sumTokens({owner =[], balances = {}}){}
async function sumTokens2({owner=[], balances={}}){
    return sumTokens({owner, balances})}

    
module.exports = {
    RPC_ENDPOINT,
    fetchList,
    multicall,
    sumTokens, 
    sumTokens2,
}

// With the Massa sdk 
// async function fetchTokenBalance(address, account){
// 	const balance =  new IERC20(address, baseClient).balanceOf(account)
//     return balance; 
// }
