const vaults = {
    arbitrum: "0x8BfED25d58d4c38a3A9BCa1aC45bcFD866A3a88c",
    bsc     : "0x5712ab97A299a8A4544BCc728B7f3E9663965443",
    avax    : "0x5712ab97A299a8A4544BCc728B7f3E9663965443",
    polygon : "0x5712ab97A299a8A4544BCc728B7f3E9663965443",
    fantom  : "0x139b227B7Fc46CE6AB2efE7cE6463DD97E6b0A7A",
    kava    : "0x5712ab97A299a8A4544BCc728B7f3E9663965443",
}

async function tvl(_, _1, _2, { api }) {
    const vault = vaults[api.chain];
    const tokens = await api.call({
        abi: 'function getAcceptingTokens () view returns (address[])',
        target: vault,
        params: [],
    });
    for(let token of tokens) {
        const stakedAmount = await api.call({
            abi: 'function getStakedAmountPerToken(address token) view returns (uint256)',
            target: vault,
            params: [token],
        });
        const balance = await api.call({
            abi: 'erc20:balanceOf',
            target: token,
            params: [vault],
        });
        api.add(token, Number(stakedAmount) + Number(balance));
    }
}

module.exports = {
    methodology: 'TVL of the mozaic',
    arbitrum: {
        tvl
    },
    bsc: {
        tvl
    },
    avax: {
        tvl
    },
    polygon: {
        tvl
    },
    fantom: {
        tvl
    },
    kava: {
        tvl
    },
};