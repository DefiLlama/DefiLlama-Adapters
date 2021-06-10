const sdk = require("@defillama/sdk");

async function tvl(timestamp, block) {
    let balances = {};

    const VaultCoreAddress = '0x4026BdCD023331D52533e3374983ded99CcBB6d4';
    const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; 
    const wbtc = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
    const usdc = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
    
    let wethLocked = await sdk.api.erc20.balanceOf({
      owner: VaultCoreAddress,
      target: weth,
      block
    });
    sdk.util.sumSingleBalance(balances, weth, wethLocked.output);

    let wbtcLocked = await sdk.api.erc20.balanceOf({
      owner: VaultCoreAddress,
      target: wbtc,
      block
    });
    sdk.util.sumSingleBalance(balances, wbtc, wbtcLocked.output);

    let usdcLocked = await sdk.api.erc20.balanceOf({
      owner: VaultCoreAddress,
      target: usdc,
      block
    });
    sdk.util.sumSingleBalance(balances, usdc, usdcLocked.output);

return balances

}

module.exports = {
  tvl
}
