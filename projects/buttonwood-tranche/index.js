const abi = require('./abi.json');
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  ethereum: {
    bondFactories: [
      "0x019fa32d71bb96922695c6cdea33774fdeb04ac0",
      "0x71868d38ea3b3eb5e4db9a45ee355548b46c82e0",
      "0x72799ffd1f4ccf92ea2b1ee0cada16a5461c4d96",
      "0xfc74f7b04c620dad6a750d4f60f13586e2b1ef54",
      "0x17550f48c61915A67F216a083ced89E04d91fD54",
    ],
    fromBlock: 13779573
  },
}

async function getAllBondsFromBondFactory(api, bondFactory, fromBlock) {
  // Iterating over all the bonds created by the bondFactory
  const logs = await getLogs({
    api,
    target: bondFactory,
    eventAbi: 'event BondCreated(address creator, address newBondAddress)',
    onlyArgs: true,
    fromBlock,
  })
  return logs.map(i => i.newBondAddress);
}

Object.keys(config).forEach(chain => {
  const { bondFactories, fromBlock } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {

      // Collecting all the bonds
      const allBonds = await Promise.all(
        bondFactories.map(bondFactory => getAllBondsFromBondFactory(api, bondFactory, fromBlock))
      ).then(bonds => bonds.flat(1));

      // Collecting all of the collateralTokens for each bond in a map
      const collateralTokens = await api.multiCall({ abi: abi.collateralToken, calls: allBonds })
      const trancheCounts = await api.multiCall({ abi: abi.trancheCount, calls: allBonds })
      const owners = [...allBonds]
      const tokens = [...collateralTokens]
      const calls = []
      trancheCounts.forEach((trancheCount, i) => {
        for (let j = 0; j < trancheCount; j++) {
          tokens.push(collateralTokens[i])
          calls.push({ target: allBonds[i], params: j })
        }
      })
      const tranches = await api.multiCall({ abi: abi.tranches, calls })
      tranches.forEach(tranche => owners.push(tranche.token))
      return sumTokens2({ api, tokensAndOwners2: [tokens, owners], permitFailure: true, blacklistedTokens: ['0xf0406c59da4880fe41ded41990af0ac594a6ef53'] })
    }
  }
})
