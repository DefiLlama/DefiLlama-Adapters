const sdk = require('@defillama/sdk')
const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('./abi.json')
const BigNumber = require("bignumber.js");

const AssetVault = '0x9485711f11B17f73f2CCc8561bcae05BDc7E9ad9';
const VaultStrategy = '0x396aBF9fF46E21694F4eF01ca77C6d7893A017B2';

const ethTvl = async (timestamp, block) => {
    const totalValue = await sdk.api.abi.call({
        target: VaultStrategy,
        block,
        abi: abi.totalValue
    });

    const vaultBalance = await sdk.api.eth.getBalance({
        target: AssetVault,
        block: block
    });
    
    return {
        [ADDRESSES.null]: BigNumber(totalValue.output).plus(vaultBalance.output),
    };
}

module.exports = {
    start: 18182242,
    ethereum: {
        tvl: ethTvl
    },
}
