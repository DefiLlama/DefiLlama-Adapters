const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokens2, sumOrcaLPs } = require('./helper/solana')

async function tvl() {
  const orcaPoolsTVL = await sumOrcaLPs([
    //usdt/usdc
    ["GjpXgKwn4VW4J2pZdS3dovM58hiXWLJtopTfqG83zY2f", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
    //SOL/USDC
    ["FFdjrSvNALfdgxANNpt3x85WpeVMdQSH5SEP2poM8fcK", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
    //ETH/USDC
    ["HDP2AYFmvLz6sWpoSuNS62JjvW4HjMKp7doXucqpWN56", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
    //SOL/USDT
    ["71vZ7Jvu8fTyFzpX399dmoSovoz24rVbipLrRn2wBNzW", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
    //ORCA/USDC
    ["Gc7W5U66iuHQcC1cQyeX9hxkPF2QUVJPTf1NWbW8fNrt", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
    //ORCA/SOL
    ["B5waaKnsmtqFawPspUwcuy1cRjAC7u2LrHSwxPSxK4sZ", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
    //mSOL/USDC[aquafarm]
    ["9y3QYM5mcaB8tU7oXRzAQnzHVa75P8riDuPievLp64cY", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
    //BTC/mSOL[aquafarm]
    ["6uA1ADUJbvwYJZpzUn9z9LuyKoRVngBKcQTKdXsSivA8", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
    //ETH/SOL
    ["CGFTRh4jKLPbS9r4hZtbDfaRuC7qcA8rZpbLnVTzJBer", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
    //mSOL/SOL[stable][aquafarm]
    ["576ABEdvLG1iFU3bLC8AMJ3mo5LhfgPPhMtTeVAGG6u7", "7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW"],
  ])
  const balances = {
    tether: orcaPoolsTVL
  }
  const owner = '7Ne6h2w3LpTNTa7CNYcUs7UkjeJT3oW7jcrXWfVScTXW'
  const tokens = [
    ADDRESSES.solana.USDC,
    '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    ADDRESSES.solana.USDT,
    '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    ADDRESSES.solana.SOL,
    '9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i',
    'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
  ]
  return sumTokens2({ balances, owner, tokens })

}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  solana: {
    tvl,
  },
  methodology: 'TVL consists of deposits made to the protocol and like other lending protocols, borrowed tokens are not counted. Coingecko is used to price tokens.',
}
