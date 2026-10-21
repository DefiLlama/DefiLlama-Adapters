const AGT_TOKEN = '0x130ae863F28E1D990a975F700F536DDFc793dcf2';

async function tvl(api) {
    // Total circulating supply of ERC-3643 tokenized real-world assets (AGT)
    const totalSupply = await api.call({
        abi: 'erc20:totalSupply',
        target: AGT_TOKEN,
    });
    api.add(AGT_TOKEN, totalSupply);
}

module.exports = {
    methodology: 'TVL counts the total circulating supply of ERC-3643 tokenized assets (AGT) issued on BOT Chain.',
    bot: {
        tvl,
    },
};
