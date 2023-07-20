const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json');
const ETH_POOL_ADDRESS = "0x3d18AD735f949fEbD59BBfcB5864ee0157607616";

async function tvl(timestamp, block) {
    let  { output } = await sdk.api.eth.getBalance({
            target: ETH_POOL_ADDRESS,
            block: block,
            chain: "ethereum"
    });
    return { [`${ADDRESSES.null}`] : output};
}


module.exports = {
    start: 1685386800, // 19/05/2023 @ 07:00pm UTC
    ethereum: { tvl },
};