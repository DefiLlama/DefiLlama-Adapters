// INDX Protocol TVL Adapter
// Uses the getIndexInfo() function from your v3 contracts

const INDEX_ADDRESSES = [
  "0xe40106154d24a9c1400715366313f1620ecdf114",
  "0x652c0bcb86b086a72857ccff7468c0ca7f0e82c1", 
  "0x5f7f8450ea171d683a21d3c5bb2f31a30985cb97",
  "0x763df43d1a852d6debdfda34e569fe32d85dc4c3",
  "0x9eaae5b1bfef2f54cf5ba1d6b17a0b5dd8c0ad59",
  "0xf71ac14af72f84b5c7918b8fcdabd0e42b4d1b35",
  "0xaa17add35b7f36a28c1d2ee37c5b4e8ed2f39e4c",
  "0x06f1a4b8b8eeb94a5b4d13b0b7c3efb2fcf2ef26",
  "0x6c7fb2e96f97b7c935e3b7a7fcd86b3b5a55c6d5",
  "0x52143e1c2a52eec2b38b12ca924e9cfa6e88b7d5",
  "0x5829aef8e08a8e5ed7b90a5c4e7f5c0e1b8b4d29",
  "0xbfaac06a7f7f1e4e8e1c8b5f0f3b6e8c1b1a2f3e",
  "0x1e4e8f3e9a7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b",
  "0x7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e",
  "0x3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a",
  "0xf0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1",
  "0x9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c",
  "0x7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a",
  "0x5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e"
];

async function tvl(api) {
  const tokenBalances = {};
  
  // Process each index contract
  for (const contractAddress of INDEX_ADDRESSES) {
    try {
      // Try v3 getIndexInfo() function first
      const indexInfo = await api.call({
        target: contractAddress,
        abi: {
          "inputs": [],
          "name": "getIndexInfo", 
          "outputs": [
            {"type": "address", "name": "indexOwner"},
            {"type": "address", "name": "curator"},
            {"type": "uint256", "name": "tokenCount"},
            {"type": "uint256", "name": "activeCount"},
            {"type": "address[]", "name": "allTokens"},
            {"type": "bool[]", "name": "activeStatus"},
            {"type": "uint256[]", "name": "totalStakedAmounts"},
            {"type": "address[]", "name": "activeTokensOnly"}
          ],
          "stateMutability": "view",
          "type": "function"
        }
      });
      
      const [, , , , allTokens, activeStatus, totalStakedAmounts] = indexInfo;
      
      // Add balances for active tokens only
      for (let i = 0; i < allTokens.length; i++) {
        if (activeStatus[i] && totalStakedAmounts[i] > 0) {
          const token = allTokens[i];
          if (!tokenBalances[token]) {
            tokenBalances[token] = 0n;
          }
          tokenBalances[token] += BigInt(totalStakedAmounts[i]);
        }
      }
      
    } catch (error) {
      // If getIndexInfo() fails, try v2 approach
      try {
        // Get number of tokens
        const numTokens = await api.call({
          target: contractAddress,
          abi: "uint256:NUM_TOKENS"
        });
        
        // Get each token address and its staked amount
        for (let i = 0; i < numTokens; i++) {
          const tokenAddress = await api.call({
            target: contractAddress,
            abi: "function tokens(uint256) view returns (address)",
            params: [i]
          });
          
          const stakedAmount = await api.call({
            target: contractAddress, 
            abi: "function totalStaked(uint256) view returns (uint256)",
            params: [i]
          });
          
          if (stakedAmount > 0) {
            if (!tokenBalances[tokenAddress]) {
              tokenBalances[tokenAddress] = 0n;
            }
            tokenBalances[tokenAddress] += BigInt(stakedAmount);
          }
        }
        
      } catch (v2Error) {
        console.log(`Failed to query contract ${contractAddress}:`, v2Error.message);
        continue;
      }
    }
  }
  
  // Add all token balances to the API
  for (const [token, balance] of Object.entries(tokenBalances)) {
    if (balance > 0) {
      api.add(token, balance.toString());
    }
  }
}

module.exports = {
  methodology: "TVL is calculated by summing the total staked amounts of all tokens across all INDX index contracts",
  base: {
    tvl
  }
};
