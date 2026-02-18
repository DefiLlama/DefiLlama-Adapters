const { callSoroban } = require('../helper/chain/stellar');

const PAIR_FACTORY_ADDRESS = 'CD5LOWLRQXTG5ZTNU4NA4NNLGGKNRJNRX45PVINVY7VCTOFQAAOYLTF5';
const TREASURY_ADDRESS = 'CDX3TMDOQ66A7UTZWDSEGPS3BVGYWHJRCXVBCMEXKLRF6X3JQNBI3UMN';

async function tvl(api) {
  const pairAddresses = await callSoroban(PAIR_FACTORY_ADDRESS, 'get_all_deployed_pairs');
  if (!pairAddresses) throw new Error(`Stellar API returned no pairs`);

  for (const pairAddress of pairAddresses) {
    const summary = await callSoroban(pairAddress, 'get_summary');
    if (!summary) throw new Error(`Stellar API returned invalid data for ${pairAddress}}`);

    // Stellar uses 7 decimal places; divide by 10^7 to get the actual USDC value
    const collateral = Number(summary.collateral.total_collateral) / 1e7;
    api.addUSDValue(collateral);
  }
}

module.exports = {
  methodology: 'Adds the total amount of collateral across all pairs on-chain.',
  stellar: { tvl },
};
