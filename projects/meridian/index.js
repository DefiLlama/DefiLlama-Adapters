const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");

const ETH_ADDRESS = ADDRESSES.null;
const TROVE_MANAGER_ADDRESS = "0x56a901FdF67FC52e7012eb08Cfb47308490A982C";

async function tvl(_, chainBlocks) {
    const troveEthTvl = (
        await sdk.api.abi.call({
            target: TROVE_MANAGER_ADDRESS,
            abi: "uint256:getEntireSystemColl",
            block: chainBlocks["base"],
            chain: "base"
        })
    ).output;

    return {
        [ETH_ADDRESS]: troveEthTvl,
    };
}

module.exports = {
    timetravel: true,
    start: 1691074571,
    base: {
        tvl,
    }
};
