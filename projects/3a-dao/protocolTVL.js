const ethers = require("ethers")
const vaultFactoryHelperData = require("./data/vaultFactoryHelper.json")
const VaultFactoryAddress = "0x4760847023fa0833221ae76E01Db1E483A5D20e0"



async function getProtocolTVL(Provider) {
    const vaultFactoryHelper = new ethers.Contract(
        vaultFactoryHelperData.address,
        vaultFactoryHelperData.abi,
        Provider
    );
    const tvl = await vaultFactoryHelper.getProtocolTvl(VaultFactoryAddress)
    const tvlHuman = ethers.formatEther(tvl)
    return tvlHuman;
}

module.exports = {
    tvl: getProtocolTVL
};