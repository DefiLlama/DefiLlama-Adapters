const {getTokenAccountBalance} = require('../helper/solana')

const markets = [
    ["8UviNr47S8eL6J3WfDxMRa3hvLta1VDJwNWqsDgtN3Cv", "solana"],
    ["8SheGtsopRUDzdiD6v6BR9a6bqZ9QwywYQY99Fp5meNf", "usd-coin"],
    ["B7Lg4cJZHPLFaGdqfaAWG35KFFaEtBMmRAGf98kNaogt", "ethereum"],
    ["4jkyJVWQm8NUkiJFJQx6ZJQhfKLGpeZsNrXoT4bAPrRv", "bitcoin"]
]

async function tvl(){
    const locked = await Promise.all(markets.map(market=>getTokenAccountBalance(market[0])))
    return locked.reduce((total, value, idx)=>{
        total[markets[idx][1]] = value;
        return total
    }, {})
}

module.exports = {
    tvl
}