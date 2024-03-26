const ADDRESSES = require("../helper/coreAssets.json");

const wemix = ADDRESSES.null;
const wwemixAddr = ADDRESSES.wemix.WWEMIX;

const dwemixAddr = "0x531e6Abe1ad0c8313ad7c8f7ad96b8e70c56164E";
const controllerAddr = "0x334f696FE78623861733444d8476C36B0e9CdfC5";

async function tvl(api) {
    // master vault wemix
    const masterVaultWemix = await api.call({
        abi: 'function balanceOf(address) public view returns (uint256 amount)',
        target: wwemixAddr,
        params: dwemixAddr
    })
    // withdrawing wemix
    const withdrawingWemix = await api.call({
        abi: 'function wemixInWithdrawing() public view returns (uint256 amount)',
        target: dwemixAddr
    })
    // strategy vault wemix
    const strategyVaultWemix = await api.call({
        abi: 'function totalAssets() public view returns (uint256 amount)',
        target: dwemixAddr
    })
    // lp wemix
    const liquidityInfo = await api.call({
        abi: 'function getLiquidityInfo() public view returns (tuple(uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1, int24 poolTickLower, int24 poolTickUpper) memory info)',
        target: controllerAddr
    })
    const lpWemix = wwemixAddr < dwemixAddr ? liquidityInfo.amount0 : liquidityInfo.amount1;

    // tvl = mvault + withdrawing + svault + lp
    api.add(wemix, masterVaultWemix);
    api.add(wemix, withdrawingWemix);
    api.add(wemix, strategyVaultWemix);
    api.add(wemix, lpWemix);
}

module.exports = {
    wemix: {
        tvl
    },
};