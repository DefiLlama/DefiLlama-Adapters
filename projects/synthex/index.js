
const sdk = require('@defillama/sdk');
const { sumTokensExport } = require("../helper/unwrapLPs");
const poolC = '0x8d6E834277E4f513BacF83B0A87524c913eF8691';
const poolF = "0x0546458d110Dff9D394C0F4621423Bc8f009A779";
const USDC = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
const WBTC = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f";
const ARB = "0x912CE59144191C1204E64559FE8253a0e49E6548";
const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const USDT = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
const DAI = "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1";


module.exports = {
    methodology: "counts value of assets in the PoolC and PoolF",
    start: 82762407,
    arbitrum: {
        tvl: sumTokensExport({
            tokensAndOwners: [
                [USDC, poolC],
                [WBTC, poolC],
                [ARB, poolC],
                [ETH, poolC],
                [DAI, poolF],
                [USDC, poolF],
                [USDT, poolF],
            ]
        }),
    },
};


