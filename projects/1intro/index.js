const { sumTokens2 } = require("../helper/solana");

async function tvl() {
    const response = await fetch("https://app.1intro.com/api/info/pools")
    const { data } = await response.json();
    const tokenAccounts = data.map(pool => pool.tokens.map(token => token.tokenAccount)).flat()

    return sumTokens2({ tokenAccounts })
}

module.exports = {
  solana: { tvl: tvl }
}