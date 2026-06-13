const tokens = [
    "0x018008bfb33d285247A21d44E50697654f754e63",
    "0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c",
    "0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a",
];

const holders = [
    "0xd8831608954c7C4044938aC76E32dA81d692f0a6",
];

async function tvl(api) {
    await api.sumTokens({ owners: holders, tokens });
}

module.exports = {
    ethereum: {
        tvl
    },
};
