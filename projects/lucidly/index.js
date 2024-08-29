const ADDRESSES = require('../helper/coreAssets.json')
const POOL_TOKEN_CONTRACT = '0x720e323B5e84945f70A8196BDa3dC1465b457551';

async function tvl(api) {
    const depositAmount = await api.call({ abi: 'uint256:totalSupply', target: POOL_TOKEN_CONTRACT, })
    api.add(ADDRESSES.null, depositAmount)
}


module.exports = {
    methodology: 'counts the total supply of the MasterVault pool token, one unit of which mathematically is equivalent to 1 ETH.',
    start: 1693971707,
    ethereum: { tvl }
};
