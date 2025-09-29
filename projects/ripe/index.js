const SGREEN_CONTRACT = '0xaa0f13488ce069a7b5a099457c753a7cfbe04d36'
const GREEN_CONTRACT = '0xd1Eac76497D06Cf15475A5e3984D5bC03de7C707'
const LEGO_TOOLS_CONTRACT = '0x3F8aE1C72a2Ca223CAe3f3e3312DBee55C4C6d5F';

async function getPairs(){
  const response = await fetch('https://api.ripe.finance/api/ripe/assets');
  const assets = await response.json();
  const assetsArray = assets.result.filter(a => a.tokenAddress.toLowerCase() !== SGREEN_CONTRACT.toLowerCase()); 
  const stabilityPoolAddress = assetsArray.find(a => a.vaultId === 1).vaultAddress
  const nonSpAssets = assetsArray.filter(a => a.vaultId > 2)

  const assetVaultPairs = [
    ...assetsArray.map(({ tokenAddress, vaultAddress }) => [tokenAddress, vaultAddress]), 
    ...nonSpAssets.map(({ tokenAddress}) => [tokenAddress, stabilityPoolAddress]),
    [GREEN_CONTRACT, SGREEN_CONTRACT]
  ];

  return assetVaultPairs;
}

async function tvl(api) {
  const pairs = await getPairs();

  // map pairs in api.call calls
  const calls = pairs.map(([token, vault]) => {
    return api.call({
      abi: 'erc20:balanceOf',
      target: token,
      params: [vault],
    });
  });

  // execute all calls
  const balances = await Promise.all(calls);
  console.log({balances})
  
  //TO DO: remove old code
  // sum balances
//   pairs.forEach(([token], index) => {
//       if(token === SGREEN_CONTRACT){
//           api.add(GREEN_CONTRACT, balances[index]);
//           return 
//         }
        
//         //api.add(token, balances[index]);
//     });
    
  
  const underlyingCalls = pairs.map(([token], index) => {
    return api.call({
        abi: "function getUnderlyingData(address, uint256) view returns (tuple(address asset, uint256 amount, uint256 usdValue, uint256 legId, address legoAddr, string legoDesc))",
      target: LEGO_TOOLS_CONTRACT,
      params: [token, balances[index]],
        
    })
  })

  const underlyingBalances = await Promise.all(underlyingCalls);
  console.log({underlyingBalances})
  underlyingBalances.forEach(({asset, amount}) => {
    if(amount !== '0'){
        api.add(asset, amount);
    }
  });
}

module.exports = {
  methodology: 'RIPE TVL',
  start: 1750961079,
  base: {
    tvl
}}; 