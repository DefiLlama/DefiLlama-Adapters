const { getBalance } = require('../helper/utils')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const config = {
  bitcoin: {
    geckoId: 'bitcoin',
    addresses: [
      'bc1qpy4jwethqenp4r7hqls660wy8287vw0my32lmy',
      '3LhhDLBVWBZChNQv8Dn4nDKFnCyojG1FqN',
      '3QsGsAXQ4rqRNvh5pEW55hf3F9PEyb7rVq',
      'bc1qr4dl5wa7kl8yu792dceg9z5knl2gkn220lk7a9',
      'bc1q4c8n5t00jmj8temxdgcc3t32nkg2wjwz24lywv',
      '14m3sd9HCCFJW4LymahJCKMabAxTK4DAqW',
    ],
    noParallel: true,
  },
  ethereum: {
    tokens: [nullAddress],
    owners: [
      '0x72a53cdbbcc1b9efa39c834a540550e23463aacb',
      '0x6262998ced04146fa42253a5c0af90ca02dfd2a3',
      '0xcffad3200574698b78f32232aa9d63eabd290703',
      '0x7758e507850da48cd47df1fb5f875c23e3340c50',
      '0x46340b20830761efd32832a74d7169b29feb9758',
    ]
  },
}

module.exports = {
  timetravel: false,
};

const chains = Object.keys(config).filter(i => i !== 'bep2')

chains.forEach(chain => {
  const { addresses, tokensAndOwners, owners, tokens } = config[chain]
  if (addresses) {
    module.exports[chain] = {
      tvl: getChainTvl(chain),
    }
  } else {
    module.exports[chain] = {
      tvl: sumTokensExport({ tokensAndOwners, chain, owners, tokens, })
    }
  }
})

function getChainTvl(chain) {
  const { addresses, geckoId, noParallel = false } = config[chain]
  return async () => {
    let balance = 0
    if (noParallel) {
      for (const account of addresses)
        balance += await getBalance(chain, account)
    } else {
      balance = (await Promise.all(addresses.map(i => getBalance(chain, i)))).reduce((a, i) => a + i, 0)
    }
    return {
      [geckoId]: balance
    }
  }
}
