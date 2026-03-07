// Aktionariat (https://aktionariat.com) is a platform for tokenizing company shares on Ethereum.
// Each token represents equity in a Swiss company, traded via Aktionariat's smart contracts.
// Token prices are sourced from the Aktionariat "trades" subgraph in the defillama-server pricing adapter.
// This adapter lists a curated set of active and relevant tokens for TVL calculation (total supply * price).
// Each event in the hallmarks section marks a TVL jump of at least 1M USD. Smaller events are filtered out.

async function getEthereumTVL(api) {
  const mainnetTokens = [
    "0x6f38e0f1a73c96cB3f42598613EA3474F09cB200", // DAKS - Aktionariat AG Shares
    "0x2E880962A9609aA3eab4DEF919FE9E917E99073B", // BOSS - Boss Info AG Shares
    "0x553C7f9C780316FC1D34b8e14ac2465Ab22a090B", // REALU - RealUnit Schweiz AG Shares
    "0x56528C1dF17FD5451451eB6EFDE297758bc8f9a1", // AFS - Alan Frei Company Shares
    "0x8747a3114Ef7f0eEBd3eB337F745E31dBF81a952", // DQTS - Quitt.ch ServiceHunter AG Shares
    "0x343324F53CBEEE3Ee6d171f2a20F005964C98047", // LENDS - Switzerlend AG Shares
    "0xc0da2786176dac9eda661c566828950ca571348c", // ARTS - ArtLeasing AG Shares
    "0xeb3A8874eeE15A55CB0380540A93DBeeac1B13B2", // FFS - FinanceFarm AG Shares
    "0x4e8de529fE22deE9266B029CdfC52142b82e0e2F", // VEGS - Outlaws Food AG Shares
    "0xc95506540268b0447663efBFffd71b51Fe92eA7f", // WMKT - WeMakeIt Shares
    "0xe221db71c5c527149bdf56c4d13a54cf55e543c1", // VIDS - vidby Shares SHA   
    "0xbc8538387481dfb0c6a5acb62226b3144d60e108", // RSAS - Revario SA Shares SHA 
    "0x17f7fea5f87d0f289d9827be78fc96027f8ed724", // EHCK - EHC Kloten Partizipationsschein 
    "0xa2d6b59758d307df27d5809426252d91a060cb24", // PNS - parknsleep AG Shares SHA  
    "0x2adcbee886d23eff5adecc7767bf102e4a1ce151", // VEDA - AyurVeda AG Shares
    "0xa995d67fd0187b4b8fea3a60e11f31a08e4ac40b", // PDS - PensionDynamics by ICR SHA
    "0x859336669a5aee857810e59716b0db08468f9f84", // SNXS - SONIX SA Shares SHA 
    "0x2ab2dbfdde4566b0da9dba8c87c2e6eab83b87a7", // RDFS - Robin des Fermes SA Shares SHA 
  ]

  api.add(mainnetTokens, await getSupplies(api, mainnetTokens))
}

async function getSupplies(api, tokens) {
  return await api.multiCall({ abi: 'erc20:totalSupply', calls: tokens })
}

module.exports = {
  methodology: `Retrieves share tokens issued on the Aktionariat platform that have an active market, and their onchain supply.`,
  ethereum: { tvl: getEthereumTVL },
  hallmarks: [
    ['2021-01-30', 'Tokenized Aktionariat AG (DAKS)'],
    ['2021-02-28', 'Tokenized quitt.ch ServiceHunter AG (DQTS)'],
    ['2021-06-14', 'Tokenized Boss Info AG (BOSS)'],
    ['2022-04-12', 'Tokenized RealUnit Schweiz AG (REALU)'],
    ['2022-07-06', 'Tokenized vidby AG (VIDS)'],
    ['2022-08-22', 'Tokenized WeMakeIt (WMKT)'],
    ['2022-11-28', 'Tokenized Alan Frei Company (AFS)'],
    ['2023-01-12', 'Tokenized EHC Kloten (EHCK)'],
    ['2023-02-07', 'Tokenized Outlaws Food AG (VEGS)'],
    ['2023-11-06', 'Tokenized parknsleep AG (PNS)'],
    ['2023-12-18', 'Tokenized Switzerlend AG (LENDS)'],
    ['2025-07-01', 'Launch of Secondary Trading'],
    ['2025-08-12', 'Tokenized Revario SA (RSAS)'],
    ['2026-02-15', 'Launch of Investor Pages with integrated markets'],
  ],
}

