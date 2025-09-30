const SGREEN_CONTRACT = '0xaa0f13488ce069a7b5a099457c753a7cfbe04d36'
const GREEN_CONTRACT = '0xd1Eac76497D06Cf15475A5e3984D5bC03de7C707'
const LEGO_TOOLS_CONTRACT = '0x3F8aE1C72a2Ca223CAe3f3e3312DBee55C4C6d5F';
const USDC_CONTRACT = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
const GREEN_LP_CONTRACT = '0xd6c283655b42fa0eb2685f7ab819784f071459dc'
const RIPE_CONTRACT = '0x2A0a59d6B975828e781EcaC125dBA40d7ee5dDC0'
const RIPE_GREEN_LP_CONTRACT = '0x2aEf3eE3Eb64B7EC0B4ef57BB7E004747FE87eFc'
const ENDAOMENT_CONTRACT = '0x14F4f1CD5F4197DB7cB536B282fe6c59eACfE40d'

const ONE_HUNDRED = BigInt(10000)


async function getGreenLpValues(api, address){
  const [usdcBalance, greenBalance, greenLpSupply, addressLp] = await Promise.all([
    api.call({
      abi: 'erc20:balanceOf',
      target: USDC_CONTRACT,
      params: [GREEN_LP_CONTRACT],
    }),
    api.call({
      abi: 'erc20:balanceOf',
      target: GREEN_CONTRACT,
      params: [GREEN_LP_CONTRACT],
    }),
    api.call({
      abi: 'erc20:totalSupply',
      target: GREEN_LP_CONTRACT,
    }),
    api.call({
      abi: 'erc20:balanceOf',
      target: GREEN_LP_CONTRACT,
      params: [address]
    }),
  ])
  
  const usdc = BigInt(usdcBalance) 
  const green = BigInt(greenBalance)
  const lpAddressShare = (BigInt(addressLp) * ONE_HUNDRED) / BigInt(greenLpSupply)
  
  const usdcFinal = (lpAddressShare * usdc) / ONE_HUNDRED 
  const greenFinal = (lpAddressShare * green) / ONE_HUNDRED

  api.add(USDC_CONTRACT, usdcFinal)
  api.add(GREEN_CONTRACT, greenFinal)
}

async function getPairs(){
  const response = await fetch('https://api.ripe.finance/api/ripe/assets');
  const assets = await response.json();
  const assetsArray = assets.result.filter(a => a.tokenAddress.toLowerCase() !== SGREEN_CONTRACT.toLowerCase() && a.tokenAddress.toLowerCase() !== GREEN_LP_CONTRACT.toLowerCase()); 
  const stabilityPoolAddress = assets.result.find(a => a.vaultId === 1).vaultAddress
  const nonSpAssets = assetsArray.filter(a => a.vaultId > 2)

  const assetVaultPairs = [
    ...assetsArray.map(({ tokenAddress, vaultAddress }) => [tokenAddress, vaultAddress]), 
    ...nonSpAssets.map(({ tokenAddress}) => [tokenAddress, stabilityPoolAddress]),
    [GREEN_CONTRACT, SGREEN_CONTRACT]
  ];

  return {assetVaultPairs, stabilityPoolAddress};
}

async function tvl(api) {
  const { assetVaultPairs: pairs, stabilityPoolAddress } = await getPairs();

  const calls = pairs.map(([token, vault]) => {
    return api.call({
      abi: 'erc20:balanceOf',
      target: token,
      params: [vault],
    });
  });

  const balances = await Promise.all(calls);
  
  const underlyingCalls = pairs.map(([token], index) => {
    return api.call({
        abi: "function getUnderlyingData(address, uint256) view returns (tuple(address asset, uint256 amount, uint256 usdValue, uint256 legId, address legoAddr, string legoDesc))",
      target: LEGO_TOOLS_CONTRACT,
      params: [token, balances[index]],
        
    })
  })

  const underlyingBalances = await Promise.all(underlyingCalls);
  underlyingBalances.forEach(({asset, amount}) => {
    if(amount !== '0'){
        api.add(asset, amount);
    }
  });

  await getGreenLpValues(api, stabilityPoolAddress)
}

async function staking(api){
  await getGreenLpValues(api, ENDAOMENT_CONTRACT)

  const [endaoRipe, endaoRipeGreenLp, usdcEndao, greenEndao] = await Promise.all([
    api.call({
      abi: 'erc20:balanceOf',
      target: RIPE_CONTRACT,
      params: [ENDAOMENT_CONTRACT]
    }),
    api.call({
      abi: 'erc20:balanceOf',
      target: RIPE_GREEN_LP_CONTRACT,
      params: [ENDAOMENT_CONTRACT]
    }),
    api.call({
      abi: 'erc20:balanceOf',
      target: USDC_CONTRACT,
      params: [ENDAOMENT_CONTRACT]
    }),
    api.call({
      abi: 'erc20:balanceOf',
      target: GREEN_CONTRACT,
      params: [ENDAOMENT_CONTRACT]
    })
  ])
  
  api.add(RIPE_CONTRACT, endaoRipe)
  api.add(RIPE_GREEN_LP_CONTRACT, endaoRipeGreenLp)
  api.add(USDC_CONTRACT, usdcEndao)
  api.add(GREEN_CONTRACT, greenEndao)
}

module.exports = {
  methodology: 'RIPE TVL',
  start: 1750961079,
  base: {
    tvl,
    staking,
}}; 