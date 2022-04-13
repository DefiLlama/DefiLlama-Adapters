const ethers = require("ethers")

const fetch = async () => {
    const contract = await ethers.getContractAt("AstarFarm", "0x0BdD0C5406B9420B4d4251671F9F045e4FBEb758");
    return await contract.staked(); // tvl as wei
}

module.exports = {
    timetravel: true,
    methodology: "AstarFarm Tvl Calculation",
    fetch: fetch
}
