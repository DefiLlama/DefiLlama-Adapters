// INDX Protocol TVL Adapter
// Handles both v2 and v3 index contracts

const V2_ADDRESSES = [
   "0xe40106154d24a9c1400715366313f1620ecdf114",
        "0x652c0bcb86b086a72857ccff7468c0ca7f0e82c1",
        "0x5f7f8450ea171d683a21d3c5bb2f31a30985cb97",
        "0x763df43d1a852d6debdfda34e569feabf78efbad",
        "0xa10939130920bee3238b2a5cabc4bc605cce9a62",
        "0xc312f7c7a5cfb8203fcd775f97c04efa4014435c",
        "0x33174fbb5d893f2b95f28ad032fd5f80fa4c3542",
        "0x8fe2bbc2a60b86bfef0256950636fb03a94b1a44",
        "0xd06776e535b87be4ef73e9b072a9b797a2db9f36",
        "0x72f2e28e418ceef10a7e78b04163e7ef2132c094",
        "0xaf3b9bd14b96d24a9a6c2fa77243b8c488236d6d",
        "0xb6f67fc88cc546d4001b17eb3685f0cab9892f65",
        "0x14c11a6f813d075148a9964e71f74b602d667d51",
        "0x7be276bed3a1a79c11dd5724a92ef38cdd5ddbfa",
        "0xd8aa445b33298096f9d3fec4be9e04f03d2bc006",
        "0xefeb5a4a3986e44095c44eda5daf1d7aa1539e10",
        "0x1feb5976881a3cb7f55c7c87b52bda88c7a00a95",
        "0xe5a945b49dbab576e10942f1d3ffbfdf2622b6fc",
        "0x7f8be72844d84d12402e9c7037c1e8a9624b4be4",
        "0xcc9cd5113fdb3f0436640af976b5aecda0fda4e7",
        "0xd903758f5cb1408b9ba5886b343d5be99ab6ec51",
        "0x1b3dd50307571622a28b4ec85fa88f5881f4331a",
        "0xe260b1001d1d552f66124421826314bce21980de",
        "0x9d31b6b36af31a2a657cd9179bb7217b94ebb53b",
        "0xeda0dd115da6e45f8a1ccdf84b603e55677d54ab",
        "0x1da464820b018b16a329eb0564a1566f24841b61",
        "0x0d157f5e55cfe227fe307f5a625777e5457666ea",
        "0xbc13052912fc59f8de541b56e7cc23e2cf030cbe",
        "0x4cdcab7fde0925a2b6a4a99fe7dfc17012b90bac",
        "0xf22856013e1282ca1e4d3d0dc0e0d7a3ecc18edd",
        "0xda47a21132f27fcf794547d5542ee9c1a3823140",
        "0x004fc5690ade46d581b85a4c443dfdabe4083032",
        "0x88cb91ea8b1b2d513ff95c88e5b6d1220549d54c",
        "0x0023d4bfde9216399bfe57f44d395dd9d575b5ef",
        "0x3ea9d3675ea6f78f173a37082487c4f9c3ccd8d0",
        "0x5ca629986190f5cb582c3bb13c94840b3a023c17",
        "0xd747b1819e88b608f03d5c923fa86248a129141e",
        "0x57bd7e2fcac7e3d31b730e0717525d19ecea8f2e",
        "0xd63604d890972d3ed93d9ec3a4db03140c1a2682",
        "0x9c75ed9b59fa0570ad24d608e0da12f3bf8e307e",
        "0xA09f6E477e935f3145b7fd28091Ad896f941F0c5",
        "0xd332d1b508ea2b23918873eef42276af0e46deed",
        "0xeb98768f67a3d1378e5a3cbd7848643027c024c6",
        "0xd2323d47cc48c4a7799baf90e97a8457740181f9",
        "0x758d386be0a363b12ff73b09dec484ead826f8b5",
        "0x5c5f9d64c68f3aaa433a551be6a4423d1f1d0e06",
        "0x026e4f5c066495c9a282e3f59a94a3ccdf5934d6",
        "0x724434b771be9bf2b639cbdc998efc16013170c9",
        "0xbaa6c936150750fcc7765950a3092b9e4468f995",
        "0x07a643f82fe44b7d58483320e4bf67cf33bc1b4d",
        "0x92fd60ba502e3fca3c71b28b58bd194994327fc0",
        "0x089e6bd925f11963daea2d4dea8c51c3cf562f75",
	"0x4e9A00BDE25901f59272928723FF7934D999Fac1"
        
];

const V3_ADDRESSES = [
  "0x871fbd1d0cbd80917d4f6fc5b1353d45b3ba68e4",
  "0xd860dcd2f8b31dff84030b36c3160295a0d9cb39",
  "0xbec4f4b9913f1e4e2fb37597cc61f393530502fd",
  "0x3d169a9ceda1ba8cbedbbbd5a8abf976aa5a0f45",
  "0xfa064ba05fef454a74c39c2dfbe13f4728b480f7",
  "0xde80058973c55e4928be58c502231abef2c453f0"

];

async function tvl(api) {
  const tokenBalances = {};
  
  // Process v2 contracts - get all numTokens at once
  const numTokensCalls = V2_ADDRESSES.map(target => ({ target }));
  const numTokensResults = await api.multiCall({
    calls: numTokensCalls,
    abi: "uint256:NUM_TOKENS"
  });
  
  // Build calls for all token addresses and staked amounts
  const tokenCalls = [];
  const stakedCalls = [];
  
  for (let contractIndex = 0; contractIndex < V2_ADDRESSES.length; contractIndex++) {
    const contractAddress = V2_ADDRESSES[contractIndex];
    const numTokens = Number(numTokensResults[contractIndex]);
    
    for (let tokenIndex = 0; tokenIndex < numTokens; tokenIndex++) {
      tokenCalls.push({
        target: contractAddress,
        params: [tokenIndex]
      });
      stakedCalls.push({
        target: contractAddress,
        params: [tokenIndex]
      });
    }
  }
  
  // Get all token addresses and staked amounts at once
  const tokenAddresses = await api.multiCall({
    calls: tokenCalls,
    abi: "function tokens(uint256) view returns (address)"
  });
  
  const stakedAmounts = await api.multiCall({
    calls: stakedCalls,
    abi: "function totalStaked(uint256) view returns (uint256)"
  });
  
  // Process v2 results
  for (let i = 0; i < tokenAddresses.length; i++) {
    const tokenAddress = tokenAddresses[i];
    const stakedAmount = stakedAmounts[i];
    
    if (stakedAmount && BigInt(stakedAmount) > 0n) {
      if (!tokenBalances[tokenAddress]) {
        tokenBalances[tokenAddress] = 0n;
      }
      tokenBalances[tokenAddress] += BigInt(stakedAmount);
    }
  }
  
  // Process v3 contracts - get all index info at once
  const v3Calls = V3_ADDRESSES.map(target => ({ target }));
  const v3Results = await api.multiCall({
    calls: v3Calls,
    abi: "function getIndexInfo() view returns (address indexOwner, address curator, uint256 tokenCount, uint256 activeCount, address[] allTokens, bool[] activeStatus, uint256[] totalStakedAmounts, address[] activeTokensOnly)"
  });
  
  // Process v3 results
  for (const indexInfo of v3Results) {
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
  }
  
  // Add all token balances to the API
  for (const [token, balance] of Object.entries(tokenBalances)) {
    if (balance > 0) {
      api.add(token, balance.toString());
    }
  }
}

module.exports = {
  methodology: "TVL is calculated by summing the total staked amounts of all tokens across all INDX index contracts (both v2 and v3)",
  base: {
    tvl
  }
};
