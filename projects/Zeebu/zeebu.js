
const ABI_TOTAL_SUPPLY_JSON = JSON.stringify([
  const sdk = require('@defillama/sdk');
  
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function",
  },
]);

async function fetchStakingDetails(api, chain) {
  try{
    //console.log("----",await sdk.api);
    console.log("chain:",chain);

    const currentBlock = await sdk.api.util.getLatestBlock(chain) ; //await api.getBlock(chain);
    console.log("currentBlock:",currentBlock);

    const totalStaked = await api.abi.call({target: VOTING_ESCROW_ADDRESSES[chain],chain: chain,block : currentBlock.block, abi : 'uint256:supply'});
    
    console.log("temp:",totalStaked);


      if (!totalStaked) {
        console.error(`[Error] totalSupply() returned undefined for ${chain}`);
        return  0 ;
      }
      //return totalStaked;
      return (parseFloat(totalStaked) / 1e18); // Assuming 18 decimals
      
    } catch (error) {
    console.error(`[Error] Failed to fetch staking details for ${chain}:`, error.message);
    return 0;
  }
}
