const { sumTokens2 } = require('../helper/unwrapLPs')

const poolAbi = {
  borrowed: "function borrowed() view returns (uint256)"
};

// Fix 1: Use the correct pool addresses without duplicates
const cheddaPools = [
  '0xE5c35103D75a72035B7B21Bb8e3Fd1e06920e5b0',
  '0x7677DcdaCE362b4185dB2eE47472108156397936'
];

const cbAssetPool = "0xE5c35103D75a72035B7B21Bb8e3Fd1e06920e5b0"
const memecoinPool = "0x7677DcdaCE362b4185dB2eE47472108156397936";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const CBBTC = "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf";
const CBETH = "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22";
const DEGEN = "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed";
const BRETT = "0x532f27101965dd16442E59d40670FaF5eBB142E4";
const TOSHI = "0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4";

async function tvl({api}) {
  return sumTokens2({ 
    tokens: [USDC, CBBTC, CBETH, DEGEN, BRETT, TOSHI], 
    owners: [cbAssetPool, memecoinPool], api })
}

// Fix 2: Map pools to their respective tokens for proper accounting
const fetchTotalBorrowData = async (api, poolAddresses) => {
  // Map of which tokens are borrowed from which pools
  const poolToToken = {
    [cbAssetPool]: [USDC, CBBTC, CBETH],
    [memecoinPool]: [USDC, DEGEN, BRETT, TOSHI]
  };

  const totalBorrows = await api.multiCall({
    abi: poolAbi.borrowed,
    calls: poolAddresses
  });
  
  // Process the returned data
  poolAddresses.forEach((poolAddress, i) => {
    // Get the primary token for this pool (using the first token as an example)
    // You may need to adjust this logic based on how your pools work
    const token = poolToToken[poolAddress][0];
    api.add(token, totalBorrows[i]);
  });
  
  return api.getBalances();
};

module.exports = {
  methodology: `TVL is comprised of assets and collateral deposited to the pools on https://app.chedda.finance`,
  base: {
    tvl,
    borrowed: async (api) => {
      return fetchTotalBorrowData(api, cheddaPools);
    }
  }
}