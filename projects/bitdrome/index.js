const USDT = '0xa67ED736649F2958A35fd249a584151056b4b745';
const WBTC = '0xB5136FEba197f5fF4B765E5b50c74db717796dcD'
const USDT_WBCT_POOL = '0x02383dC175a6EB8C58B348fBEB2Eb4e00aB7e45f';

async function tvl(api) {
    const btcBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: WBTC,
        params: [USDT_WBCT_POOL]
    })
    const usdtBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: USDT,
        params: [USDT_WBCT_POOL]
    })
    api.addTokens([WBTC, USDT], [btcBalance, USDT]);
}

module.exports = {
    methodology: 'calculate tvl of Bitdrome pools',
    start: 1981544,
    bevm: {
        tvl
    }
}