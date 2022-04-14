const ethers = require("ethers")

const fetch = async () => {
    const rpcUrl = "https://rpc.astar.network:8545";
    const provider = await ethers.getDefaultProvider(rpcUrl);
    const contract = new ethers.Contract(
      "0x0BdD0C5406B9420B4d4251671F9F045e4FBEb758",
      ["function staked() external view returns (uint128)"],
      provider
    );
    return await contract.staked(); // tvl as wei
}

module.exports = {
    fetch
}
