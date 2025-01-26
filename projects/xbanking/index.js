const { sumTokens2 } = require('../helper/solana')

const tokens = [
  'So11111111111111111111111111111111111111112', 
  '4k3Dyjzvzp8e4P7SNLLA8vZFaep2XDbD2W37D5u7yCK', 
  'Es9vMFrzaCERZhC8LCyD9F5Zszdnwf4Gpfn3xFn1i1kA',
  'So11111111111111111111111111111111111111112',
  '2uAuGwYH22SJJtaTqMJ2AGEL2rBdiRKkuak2QCCSaFCA'
]

const owners = [
  'EjqH5TsEp7Ks1BdVKoLjsNwDsYARzpGDEvhw7srYvs5w',
  '5MfcrehHKskxjiYTTqcKubtqmrMJuyNParmeQYgNLdkA',
]

async function tvl() {
  return sumTokens2({
    tokens, 
    owners,
  })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "xbanking tvl",
  solana: {
    tvl,
  },
}
