const { ethers } = require("ethers");

module.exports = {
  timetravel: false, // Historical data not supported
  misrepresentedTokens: false, // No misrepresented tokens
  methodology: "TVL is calculated by fetching the Total AUM (which includes broker funds) and separating the broker-managed funds from the on-chain contract balance for transparency.",
  ethereum: {
    tvl: async () => {
      const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC);

      // Contract details
      const contractAddress = "0x563D1bbC7ccb89A5D46DDfbdbBC30F3C493b8E06";
      const abi = [
        "function totalAUM() view returns (uint256)", // ABI for Total AUM
        "function getContractBalance() view returns (uint256)", // ABI for Contract Balance
      ];

      const contract = new ethers.Contract(contractAddress, abi, provider);

      // Fetch Total AUM
      const totalAUM = await contract.totalAUM(); // Total funds (Broker + Contract)
      // Fetch Contract Balance
      const contractBalance = await contract.getContractBalance(); // On-chain balance

      // Calculate Broker Balance
      const brokerBalance = totalAUM.sub(contractBalance); // Broker-managed funds

      // Return detailed breakdown
      return {
        totalAUM: totalAUM.toString(),
        contractBalance: contractBalance.toString(),
        brokerBalance: brokerBalance.toString(),
      };
    },
  },
};
