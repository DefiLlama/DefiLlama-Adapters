const AGT_TOKEN = '0x130ae863F28E1D990a975F700F536DDFc793dcf2';
const DIVIDEND_DISTRIBUTOR = '0x50D17b36F8d0D28D343fFF298bd4958CFEFEEDC1';
const USDC_RESERVE = '0x16F7975FEba6F69b52D896858581d75010446E4E';

async function tvl(api) {
    // 1. Total circulating supply of tokenized real-world assets (AGT)
    const totalSupply = await api.call({
        abi: 'erc20:totalSupply',
        target: AGT_TOKEN,
    });
    api.add(AGT_TOKEN, totalSupply);

    // 2. Unclaimed dividend reserves held in the DividendDistributor contract
    const usdcLocked = await api.call({
        abi: 'erc20:balanceOf',
        target: USDC_RESERVE,
        params: [DIVIDEND_DISTRIBUTOR],
    });
    api.add(USDC_RESERVE, usdcLocked);
}

module.exports = {
    methodology: 'TVL counts the total circulating supply of ERC-3643 tokenized assets (AGT) issued on BOT Chain and reserve funds deposited in the DividendDistributor contract.',
    bot: {
        tvl,
    },
};
