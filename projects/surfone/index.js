const sdk = require("@defillama/sdk");
const factoryContract = '0x5FeD7c030a1B3b40988984479Fdd666dE81038A3'
const positionContract = '0x1fa9702e774D31aB661D84f449b0Aa22c41D6827'
const usdc = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const weth = '0x4200000000000000000000000000000000000006'

async function tvl(timestamp, block, chainBlock, { api }) {
  const data = await api.call({ abi: abi.getAllPools, target: factoryContract })
  const ownerTokens = data.map(i => [[i.baseToken], i.pool])

  const usdcBalance = await sdk.api.abi.call({
    target: usdc,
    params: positionContract,
    abi: 'erc20:balanceOf',
    chain: 'base'
  });

  const wethBalance = await sdk.api.abi.call({
    target: weth,
    params: positionContract,
    abi: 'erc20:balanceOf',
    chain: 'base'
  });

  // Convert balances to numbers if necessary and append to the ownerTokens array
  ownerTokens.push([usdc, positionContract, Number(usdcBalance.output)]);
  ownerTokens.push([weth, positionContract, Number(wethBalance.output)]);

  // Sum all tokens (including USDC and WETH) to calculate the TVL
  return api.sumTokens({ tokensAndOwners: ownerTokens, block });
}


  module.exports = {
  start: 8048857,
  base: {tvl},
  methodology: "Count the total balance across all fee pools for all trading pairs.",
}

const abi = {
  "getAllPools": "function getAllPools() view returns (tuple(address baseToken, address spotToken, bytes32 spotTokenKey,string baseName,string spotName,uint24 feeP,address pool,uint256 index,uint8 groupIndex, uint256 chainId,bool reverse,uint256 flag)[])"
}

