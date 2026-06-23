const { getTokenSupplies, sumTokens2 } = require('../helper/solana')

const data = [
    {
        "name": "Circle Internet Group rStock",
        "address": "5fKr9joRHpioriGmMgRVFdmZge8EVUTbrWyxDVdSrcuG", 
        "issuer": "4A3psCthh7VBouNK24QSqhXmgZQA7BB9ReS8qruD8ZnF"
    },
    {
        "name": "MicroStrategy Inc rStock",
        "address": "B8GKqTDGYc7F6udTHjYeazZ4dFCRkrwK2mBQNS4igqTv", 
        "issuer": "CWcebtehmM2ijRXdhv37PkLhZTuteWp785kwxdB5QF2a"
    },
    {
        "name": "NVIDIA Corporation rStock",
        "address": "ALTP6gug9wv5mFtx2tSU1YYZ1NrEc2chDdMPoJA8f8pu", 
        "issuer": "4WUezna5cvS7PFUMvWB7Za8eLVCKk5xBNTJVfjkoZrfk"
    },
    {
        "name": "S&P500 rStock",
        "address": "AVw2QGVkXJPRPRjLAceXVoLqU5DVtJ53mdgMXp14yGit", 
        "issuer": "D6Cx5zSd4q5fmRsrpWUeGNVyTBK7ZVqe1CbHEiKZiFSz"
    },
    {
        "name": "Tesla, Inc. rStock",
        "address": "FJug3z58gssSTDhVNkTse5fP8GRZzuidf9SRtfB2RhDe", 
        "issuer": "8y4fB4ERT5yJ4jzdAeuKupeLeqBJ9YaTrEn9yZyNpDiz"
    },
];

async function tvl(api) {
    const tokens = data.map(stock => stock.address).filter(Boolean);
    const supplies = await getTokenSupplies(tokens);
    const issuers = await sumTokens2({ tokenAccounts: data.map(stock => stock.issuer)})
    api.add(tokens, tokens.map((token) => supplies[token] ? supplies[token] - issuers[`solana:${token}`] : '0'));
}

module.exports = {
    solana: { tvl }
}