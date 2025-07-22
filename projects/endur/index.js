/**
 * Endur is a liquid staking solution for STRK
 */

const {multiCall} = require("../helper/chain/starknet");
const ADDRESSES = require('../helper/coreAssets.json');
const { ERC4626AbiMap } = require('./erc4626abi')

const LSTDATA = [{ //data of an LST contract; currently only xSTRK 
    address: "0x28d709c875c0ceac3dce7065bec5328186dc89fe254527084d1689910954b0a", // address of xSTRK vault contract
    token: ADDRESSES.starknet.STRK
}]

// returns the tvl of the all LST tokens in terms of their native token 
async function tvl(api) {
    const totalAssets = await multiCall({
        calls: LSTDATA.map(c => c.address),
        abi: ERC4626AbiMap.total_assets
    });
    // the balance of the tokens will be xTOKEN 
    // considering all 1 TOKEN = 1xTOKEN
    // eg for now we only have xSTRK i.e 1 STRK = 1 xSTRK

    api.addTokens(LSTDATA.map(c => c.token), totalAssets);
}

module.exports = {
    doublecounted: true,
    methodology: "The TVL is the total staked STRK managed by Endur's LST",
    starknet: {
        tvl,
    },
};