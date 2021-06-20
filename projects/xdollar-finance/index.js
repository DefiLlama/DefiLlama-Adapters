const sdk = require("@defillama/sdk");
const getEntireSystemCollAbi = require("./getEntireSystemColl.abi.json")

const maticAddress = "0x0000000000000000000000000000000000001010";
const troveManagerAddress = "0x68738A47d40C34d890168aB7B612A6f649f395e4";

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};

    const info  = (
        await sdk.api.abi.call({
            target: troveManagerAddress,
            abi: getEntireSystemCollAbi,
            block: chainBlocks['polygon'],
            chain: 'polygon'
        })
    ).output;

    sdk.util.sumSingleBalance(balances, `polygon:${maticAddress}`, info);

    return balances;
};

module.exports = {
    polygon: {
        tvl: polygonTvl,
    },
    tvl: sdk.util.sumChainTvls([polygonTvl]),
};
