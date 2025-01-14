const ADDRESSES = require('../helper/coreAssets.json')

const { sumTokensExport } = require("../helper/unwrapLPs");
const poolC = '0x8d6E834277E4f513BacF83B0A87524c913eF8691';
const poolF = "0x0546458d110Dff9D394C0F4621423Bc8f009A779";
const USDC = ADDRESSES.arbitrum.USDC;
const WBTC = ADDRESSES.arbitrum.WBTC;
const ARB = ADDRESSES.arbitrum.ARB;
const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const WETH = ADDRESSES.arbitrum.WETH;
const USDT = ADDRESSES.arbitrum.USDT;
const DAI = ADDRESSES.optimism.DAI;


module.exports = {
    methodology: "counts value of assets in the PoolC and PoolF",
    arbitrum: {
        tvl: sumTokensExport({
            ownerTokens: [
                [[USDC, WBTC, ARB, ETH, WETH], poolC],
                [[USDC, DAI, USDT], poolF],
            ]
        }),
    },
};


