const { getTokenSupplies, sumTokens2 } = require('../helper/solana')

const data = [
    {
        "name": "Circle Internet Group rStock",
        "address": "5fKr9joRHpioriGmMgRVFdmZge8EVUTbrWyxDVdSrcuG", 
    },
    {
        "name": "MicroStrategy Inc rStock",
        "address": "B8GKqTDGYc7F6udTHjYeazZ4dFCRkrwK2mBQNS4igqTv",
    },
    {
        "name": "NVIDIA Corporation rStock",
        "address": "ALTP6gug9wv5mFtx2tSU1YYZ1NrEc2chDdMPoJA8f8pu", 
    },
    {
        "name": "S&P500 rStock",
        "address": "AVw2QGVkXJPRPRjLAceXVoLqU5DVtJ53mdgMXp14yGit", 
    },
    {
        "name": "Tesla, Inc. rStock",
        "address": "FJug3z58gssSTDhVNkTse5fP8GRZzuidf9SRtfB2RhDe", 
    },
];

async function tvl(api) {
    const tokens = data.map(stock => stock.address).filter(Boolean);
    const supplies = await getTokenSupplies(tokens);
    api.add(tokens, tokens.map((token) => supplies[token] ? supplies[token] : '0'));
}

module.exports = {
    solana: { tvl }
}