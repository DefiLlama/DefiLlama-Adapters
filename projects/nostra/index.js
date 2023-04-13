const { multiCall, parseAddress, sumTokens, } = require('../helper/chain/starknet')
const { assetTokenAbi } = require('./abi');

const vault = '0x03d39f7248fb2bfb960275746470f7fb470317350ad8656249ec66067559e892'
const debtTokens = [
  '0x075b0d87aca8dee25df35cdc39a82b406168fa23a76fc3f03abbfdc6620bb6d7',
  '0x040b091cb020d91f4a4b34396946b4d4e2a450dbd9410432ebdbfe10e55ee5e5',
  '0x03b6058a9f6029b519bc72b2cc31bcb93ca704d0ab79fec2ae5d43f79ac07f7a',
  '0x0362b4455f5f4cc108a5a1ab1fd2cc6c4f0c70597abb541a99cf2734435ec9cb',
  '0x065c6c7119b738247583286021ea05acc6417aa86d391dcdda21843c1fc6e9c6',
]

async function tvl(_, _1, _2, { api }) {
  let underlyings = await multiCall({ calls: debtTokens, abi: assetTokenAbi.underlyingAsset })
  underlyings = underlyings.map(parseAddress)
  return sumTokens({ api, owner: vault, tokens: underlyings})
}

async function borrowed(_, _1, _2, { api }) {
  let data = await multiCall({ calls: debtTokens, abi: assetTokenAbi.totalSupply });
  let underlyings = await multiCall({ calls: debtTokens, abi: assetTokenAbi.underlyingAsset })
  underlyings = underlyings.map(parseAddress)
  data = data.map(i => +i)
  api.addTokens(underlyings, data)
}

module.exports = {
  methodology: 'Sums the circulating supply of each Nostra Asset Token.',
  starknet: {
    tvl, borrowed,
  }
};
