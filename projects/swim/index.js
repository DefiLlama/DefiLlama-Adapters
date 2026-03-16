const { sumTokens2, } = require("../helper/solana")

const owners = [
  'AfhhYsLMXXyDxQ1B7tNqLTXXDHYtDxCzPcnXWXzHAvDb', // Hexapool
  'Ha7YEA5wRWyH2htfyMXw3VfLbtBHm4UoVXMpq8Ev6zJh', // Meta Avax-USDC
  'EpvBni7vTfbTG95zf9sNcS9To1NEKnVMpCwZdb21tKsg', // Meta Avax-USDT
  '2iLTifF3JDP65AjFKZ3t4mgfJdQVSmVCiM8Zca3TgvpU', // Meta Polygon-USDC
  '3uxBU3fRZzp3V7v9MTNZiDmjxDkKh3rZutLwFtnjJ2pQ', // Meta Polygon-USDT
  '57k3vNmCivSYn7EwQNjcNFcCWAdohZ9xACfMhJGwKiBq', // GSTBNB-GSTSOL
  'HZr3bF8YEJWMV75Wi3aFEHEyLLk61VyQduXtunWtXNVQ', // GMTBNB-GMTSOL
  'DqTF8aZu63iHF55tBz1ePuaBKJ3F2srNVha3B4PpCT4N', // Meta Aurora-USDC
  '23CU3bqMJoRTpvyti84CmPbkAyNJDnTZE7DYj6MnhGdK', // Meta Aurora-USDT
  'H7BkMwbJfLiWE9sSDATHTqXykm1xBjeRzzLDatW2QdEt', // Meta Fantom-USDC
  '4XQz1qHMMTkFETn5PSNyLVutYPyZ4han8RB8Mmw1G48Q', // Meta Karura-USDT
]

async function tvl() {
  return sumTokens2({ owners });
}

module.exports = {
  hallmarks: [
    ['2022-11-07', "Sunsetting announced"]
  ],
  timetravel: false,
  solana: {
    tvl
  },
};