const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');

async function tvl(api){
    const block = await sdk.blocks.getBlock('bsc', api.timestamp)
    const supply = await sdk.api2.abi.call({ chain: 'bsc', target: ADDRESSES.bsc.WCC, abi: 'erc20:totalSupply', block: block.number });
    api.add(ADDRESSES.bsc.WCC, supply)
    return {[`bsc:${ADDRESSES.bsc.WCC}`]: supply}
}

module.exports = {
  bsc: { tvl },
  methodology: `The TVL for wCC is determined by the amount of wCC deposit * wCC price, as it's not yet possible to check CC custody natively on Canton Network.`,
};
