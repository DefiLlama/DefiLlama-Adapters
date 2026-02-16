const { callSoroban } = require('../helper/chain/stellar');

const PAIR_FACTORY_ADDRESS = 'CD5LOWLRQXTG5ZTNU4NA4NNLGGKNRJNRX45PVINVY7VCTOFQAAOYLTF5';
const TREASURY_ADDRESS = 'CDX3TMDOQ66A7UTZWDSEGPS3BVGYWHJRCXVBCMEXKLRF6X3JQNBI3UMN';

async function tvl(api) {
  const pairAddresses = await callSoroban(PAIR_FACTORY_ADDRESS, 'get_all_deployed_pairs');

  if (!pairAddresses) {
    throw new Error(`Stellar API returned no pairs`);
  }

  for (const pairAddress of pairAddresses) {
    const summary = await callSoroban(pairAddress, 'get_summary');

    if (!summary) {
      throw new Error(`Stellar API returned invalid data for ${pairAddress}}`);
    }

    // Stellar uses 7 decimal places; divide by 10^7 to get the actual USDC value
    const collateral = Number(summary.collateral.total_collateral) / 1e7;
    api.addUSDValue(collateral);
  }
}

// async function liquidity(api) {
//      const pairAddresses = await callSoroban(PAIR_FACTORY_ADDRESS, 'get_all_deployed_pairs');

//   if (!pairAddresses) {
//     throw new Error(`Stellar API returned no pairs`);
//   }

//   for (const pairAddress of pairAddresses) {
//     try {
//       const liquiditySummary = await callSoroban(TREASURY_ADDRESS, 'get_collateral_info');

//       if (!liquiditySummary) {
//         throw new Error(`Stellar API returned invalid data for ${asset}`);
//       }

//       // Correct scaling: divide by 10^7 to get actual supply in millions
//       const longBalance = Number(liquiditySummary['balances']['long']) / 1e7;
//       const shortBalance = Number(liquiditySummary['balances']['short']) / 1e7;
//       const usdcBalance = Number(liquiditySummary['balances']['usdc']) / 1e7;

//       const longPrice = Number(liquiditySummary['prices']['long']) / 1e7;
//       const shortPrice = Number(liquiditySummary['prices']['short']) / 1e7;
//       const usdcPrice = Number(liquiditySummary['prices']['usdc']) / 1e7;

//       const totalValue = (longBalance * longPrice) + (shortBalance * shortPrice) + (usdcBalance * usdcPrice);

//       api.add(liquiditySummary.asset, totalValue);
//     } catch (err) {
//       throw err;
//     }
//   }
// }

module.exports = {
  methodology: 'Adds the total amount of collateral across all pairs on-chain.',
  stellar: { tvl },
};
