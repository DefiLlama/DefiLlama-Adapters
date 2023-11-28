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
    ],
    fromBlock: 13779573 },
}

async function getTranche(api, bond, index) {
  const trancheOutput = await api.call({ abi: abi.tranches, target: bond, params: [index] });
  return trancheOutput.token;
}

async function getTranches(api, bond, trancheCount) {
  const trancheArray = await Promise.all(
    [...Array(trancheCount).keys()].map(index => getTranche(api, bond, index))
  );
  return trancheArray;
}
async function getBondTranches(api, bonds) {
  return new Map(
    await Promise.all(
    bonds.map(
      bond => api.call({ abi: abi.trancheCount, target: bond})
        .then(trancheCount => getTranches(api, bond, parseInt(trancheCount)))
        .then(tranches => [bond, tranches])
    )
  ));
}

async function getBondCollateralTokens(api, bonds) {
  return new Map(await Promise.all(
    bonds.map(
      bond => api.call({ abi: abi.collateralToken, target: bond})
        .then(collateralToken => [bond, collateralToken])
    )
  ));
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
    tvl: async (_, _b, _cb, { api, }) => {

      // Collecting all the bonds
      const allBonds = await Promise.all(
        bondFactories.map(bondFactory => getAllBondsFromBondFactory(api, bondFactory, fromBlock))
      ).then(bonds => bonds.flat(1));

      // Collecting all of the collateralTokens for each bond in a map
      const collateralTokenMap = await getBondCollateralTokens(api, allBonds);

      // Collecting all of the tranches for each bond in a map
      const trancheTokenMap = await getBondTranches(api, allBonds);

      // Creating ownerToken pairs from bonds and their collateralTokens
      const bondOwnerTokens = allBonds.map(
        bond => [[collateralTokenMap.get(bond)], bond]
      )

      // Creating ownerToken pairs from tranches and the collateralTokens of their parent bond
      const trancheOwnerTokens = allBonds.flatMap(
        bond => trancheTokenMap.get(bond).map(
          tranche => [[collateralTokenMap.get(bond)], tranche]
        )
      );

      // Concatenating ownerToken pairs
      const ownerTokens = bondOwnerTokens.concat(trancheOwnerTokens);
      return sumTokens2({ api, ownerTokens, })
    }
  }
})
