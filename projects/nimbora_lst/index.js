const {multiCall} = require("../helper/chain/starknet");
const ADDRESSES = require('../helper/coreAssets.json');
const { ERC4626AbiMap } = require('./erc4626abi')

const LiquidStakingData = [{ 
    address: "0x076c4b7bb1ce744e4aae2278724adedd4906ab89998623fe1715877ecb583bde",
    token: ADDRESSES.starknet.STRK
}]

async function tvl(api) {
    const totalAssets = await multiCall({
        calls: LiquidStakingData.map(c => c.address),
        abi: ERC4626AbiMap.total_assets
    });
    api.addTokens(LiquidStakingData.map(c => c.token), totalAssets);
}

module.exports = {
    doublecounted: true,
    methodology: "The TVL is the total staked STRK managed by Nimbora Lst",
    starknet: {
        tvl,
    },
};