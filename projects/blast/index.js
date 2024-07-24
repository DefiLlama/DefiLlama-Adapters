const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens } = require('../helper/sumTokens');
const { nullAddress } = require("../helper/treasury");

const farm = "0x5f6ae08b8aeb7078cf2f96afb089d7c9f51da47d";

async function tvl(api) {
    const dsr = await api.call({
        target: "0x373238337bfe1146fb49989fc222523f83081ddb",
        abi: "function pieOf(address) external view returns (int256)",
        params: [farm]
    })
    const balances = {
        [ADDRESSES.ethereum.DAI]: dsr
    }
    await sumTokens({
        api,
        balances,
        owners: [farm],
        tokens: [ADDRESSES.ethereum.STETH, ADDRESSES.ethereum.DAI, nullAddress]
    })
    return balances
}

module.exports = {
    ethereum: { tvl }
}
