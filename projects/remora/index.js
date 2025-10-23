const { getTokenSupplies } = require('../helper/solana')

const config = {
    TSLAr: "FJug3z58gssSTDhVNkTse5fP8GRZzuidf9SRtfB2RhDe",
    CRCLr: "5fKr9joRHpioriGmMgRVFdmZge8EVUTbrWyxDVdSrcuG",
    SPYr: "AVw2QGVkXJPRPRjLAceXVoLqU5DVtJ53mdgMXp14yGit",
    MSTRr: "B8GKqTDGYc7F6udTHjYeazZ4dFCRkrwK2mBQNS4igqTv",
    NVDAr: "ALTP6gug9wv5mFtx2tSU1YYZ1NrEc2chDdMPoJA8f8pu",
}

async function solTvl(api) {
    const tokens = Object.values(config);
    const supplies = await getTokenSupplies(tokens);
    api.add(tokens, tokens.map((token) => supplies[token] || '0'));
}

module.exports = { 
    solana: {
        methodology: "Sums the total supplies of Remora's tokenized stocks.",
        tvl: solTvl 
    }
}
