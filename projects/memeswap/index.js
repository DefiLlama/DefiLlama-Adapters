const { uniTvlExport } = require('../helper/unknownTokens')

const chain = 'berachain'
const factory = '0x80DA434B49b4d3481aF81D58Eaa3817c888377d4'
const vault = '0x21F18c02B2487024018Ef3a4D95f9D436867743d'
const BERA_TOKEN = '0x0000000000000000000000000000000000000000'

async function tvl(api) {
  const tvl = await api.call({
    abi:
    {
      inputs: [],
      stateMutability: 'view',
      type: 'function',
      name: 'totalSupply',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
    }
,
    target: vault,
  });
  api.add(BERA_TOKEN, tvl)
  api.addBalances(await uniTvlExport(chain, factory)[chain].tvl(api))
}

module.exports = {
  [chain]: {
    tvl
  },
}
