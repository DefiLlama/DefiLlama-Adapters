const ADDRESSES = require('../helper/coreAssets.json')

const atETH = '0x284D81e48fBc782Aa9186a03a226690aEA5cBe0E';
const scETH = ADDRESSES.sonic.scETH;
const WETH = '0x50c42deacd8fc9773493ed674b675be577f2634b';

async function tvl(api) {
    // swapx atETH-scETH AMO
    const AMO_adapter_swapx_atETHscETH = '0x8c4c8ec44b10bcc62afaa3caa73c6b99469c48db';
    const swapx_atETHscETH_gauge = '0xBBb10f33DCDd50BD4317459A4B051FC319B29585';
    const swapx_atETHscETH_LP = "0x20737388dbc9F7E56f4Cc69D41DA62C96B355DB0"

    const vault_AMO_owned = await api.call({
        abi: 'erc20:balanceOf',
        target: swapx_atETHscETH_gauge,
        params: [AMO_adapter_swapx_atETHscETH],
    });
    const vault_total_supply = await api.call({
        abi: 'erc20:totalSupply',
        target: swapx_atETHscETH_LP,
    });
    const [vault_atETH_amount, vault_scETH_amount] = await api.call({
        abi: 'function getTotalAmounts() view returns (uint256,uint256)',
        target: swapx_atETHscETH_LP,
    });

    const AMO_atETH_amount = vault_atETH_amount * vault_AMO_owned / vault_total_supply
    const AMO_scETH_amount = vault_scETH_amount * vault_AMO_owned / vault_total_supply
    console.log(AMO_atETH_amount, AMO_scETH_amount)
    api.addTokens([atETH, scETH], [AMO_atETH_amount, AMO_scETH_amount])

}

module.exports = {
    methodology: 'AMO owned liquidity',
    sonic: {
        tvl,
    }
}; 