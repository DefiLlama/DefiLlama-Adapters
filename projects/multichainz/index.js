const ethers = require("ethers")


const RPC = {
    plume: "https://rpc.plumenetwork.xyz",
  };


  const CONTRACTS = {
    plume: "0x8bd47bC14f38840820d1DC7eD5Eb57b85d2c7808",
    // plumeTestnet: "0x3AF7D19aAeCf142C91FF1A8575A316807a0f611A"
  };

  const TVL_ABI = [
    "function getTotalSupplyInDollars() view returns (uint256)",
    "function getTotalBorrowedInDollars() view returns (uint256)",
  ];

  async function fetchTVL(chain) {
    const provider = new ethers.JsonRpcProvider(RPC[chain]);
    const contract = new ethers.Contract(CONTRACTS[chain], TVL_ABI, provider);
    
    try {
      const totalSupply = await contract.getTotalSupplyInDollars();
      const totalBorrow = await contract.getTotalBorrowedInDollars()

      const formatted = parseFloat(ethers.formatEther(totalSupply.toString())) - parseFloat(ethers.formatEther(totalBorrow.toString()))

      return formatted.toFixed()
    } catch (error) {
      console.error(`Error fetching TVL on ${chain}:`, error.message);
      return 0;
    }
  }
  

  async function tvl(api) {
    const chain = api.chain;
    const tvlAmount = await fetchTVL(chain);
    return { "usd": tvlAmount }; 
  }
  
  module.exports = {
    methodology: "Fetches TVL",
    plume: { tvl },
  };