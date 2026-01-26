const { cachedGraphQuery } = require('../helper/cache')

// @dev: mapping of XCHF, VCHF to its Bridges
const XCHFBridge = ["0xb4272071ecadd69d933adcd19ca99fe80664fc08", "0x7bbe8F18040aF0032f4C2435E7a76db6F1E346DF"];
const VCHFBridge = ["0x79d4f0232A66c4c91b89c76362016A1707CFBF4f", "0x3b71ba73299f925a837836160c3e1fec74340403"];

async function tvl(api) {
  // @dev: register bridged token as collateral for backing and TVL
  const tokensAndOwners = [XCHFBridge, VCHFBridge];

  // @dev: query of positions from minting hubs via frankencoin graph (ponder)
  const { mintingHubV1PositionV1s: positionV1s, mintingHubV2PositionV2s: positionV2s } = await cachedGraphQuery('frankencoinV1', 'https://ponder.frankencoin.com', `{ 
    mintingHubV1PositionV1s { items { position } }  
  mintingHubV2PositionV2s { items { position } }  
  }`);

  const vaults = positionV1s?.items.concat(positionV2s?.items).map(i => i.position);
  const tokens = await api.multiCall({ abi: 'address:collateral', calls: vaults })
  vaults.forEach((v, i) => {
    tokensAndOwners.push([tokens[i], v]);
  });

  /*   const symbols = await api.multiCall({ abi: 'string:symbol', calls: tokens })
    const decimals = await api.multiCall({ abi: 'uint8:decimals', calls: tokens })
    const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map((t, i) => ({ target: t, params: vaults[i] })) })
    const table = []
    tokens.forEach((t, i) => {
      let bal = bals[i] / (10 ** decimals[i])
      if (bal > 0)
        table.push({ symbol: symbols[i], decimals: decimals[i], balance: bals[i] / (10 ** decimals[i]), vault: vaults[i], token: t })
    })
  
    console.table(table) */

  return api.sumTokens({ tokensAndOwners });
}

module.exports = {
  ethereum: {
    tvl: () => new Error('skip for now, unable to pull BOSS token price'),
  },
  start: '2023-10-28',
};