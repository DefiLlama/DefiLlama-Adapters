const { sumTokens2 } = require('../helper/unwrapLPs')
const { default: BigNumber } = require('bignumber.js')
const { post } = require('../helper/http')

const ethereumEarnVaults = [
  '0xef8629D568AdCa04D0aC52C7388d5377872d7F61',
  '0xBD35B9C345fC95ae2952Ad257A6c60f2861Be5F1',
]
const earnVaults = {};
earnVaults['ethereum'] = ethereumEarnVaults;

async function tvl(api) {  
  // fetch farming lp posisitons
  if (api.chain === 'bsc' || api.chain === 'ethereum' || api.chain === 'base'){
    const farmingLpData = await post('https://backend-api.sparklex.io/metrics/farm/lp/list', {chain_id: api.chainId}, {headers: {'Content-Type': 'application/json'}});
	
    if (farmingLpData['base_response']['status_code'] == 200){
       const lpPositions = farmingLpData['lps'];
       let farmingTokenBals = {};
       
       lpPositions.forEach((lp) => {
          if (!lp) return;
          const lpValue = lp['current_value']
          if (lpValue > 0) {
              // Validate token amounts before adding them
              const token0Amount = lp['token0_amount'];
              const token1Amount = lp['token1_amount'];
              
              if (token0Amount && token0Amount > 0 && token0Amount < Number.MAX_SAFE_INTEGER) {
                  addTokenBalance(farmingTokenBals, lp['token0_address'], token0Amount);
              }
              if (token1Amount && token1Amount > 0 && token1Amount < Number.MAX_SAFE_INTEGER) {
                  addTokenBalance(farmingTokenBals, lp['token1_address'], token1Amount);
              }
          }
       });
       
       for (const [token, balance] of Object.entries(farmingTokenBals)) {
          api.add(token, balance)
       }
    }  
  
  }  

  if (api.chain === 'ethereum'){
    let _vaults = earnVaults[api.chain];
    
    // query totalAssets from earn vaults
    const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: _vaults })
    const calls = []
    const filteredBals = bals.filter((bal, i) => {
       const hasBal = +bal > 0
       if (hasBal) calls.push(_vaults[i])
       return hasBal
    })
  
    // fetch asset token for each earn vault
    const tokensAsset = await api.multiCall({ abi: 'address:asset', calls, permitFailure: true })
    filteredBals.forEach((bal, i) => {
       const token = tokensAsset[i]
       if (token) api.add(token, bal)
    })
      
  }
  
  return sumTokens2({ api, resolveLP: true })
}

function addTokenBalance(farmingTokenBals, tokenAddress, tokenAmount){
  if (tokenAmount === undefined || tokenAmount === null){
       return;
  }
  let _sumBal = farmingTokenBals[tokenAddress];
  let _newBal = BigNumber(tokenAmount);
  _sumBal = (_sumBal === undefined || _sumBal === null)? _newBal : _sumBal.plus(_newBal);
  farmingTokenBals[tokenAddress] = _sumBal;
}

module.exports = {
  doublecounted: true,
  hallmarks: [
    ["2025-07-24", "SparkleX Official Launch"],
  ]
}

const chains = ['ethereum', 'base', 'bsc']

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})