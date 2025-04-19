const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server('https://horizon.stellar.org');

const ISSUER = 'GBMAAGRUMXBRG3IG6BPG5LCO7FTE5VIRA3VF64BFII3LXC27GSEYLHKU';
// List all asset codes issued by Excellar here
const ASSET_CODES = ['USDXLR']; // Extend this array as needed

async function fetch() {
  const results = {};
  for (const code of ASSET_CODES) {
    const asset = new StellarSdk.Asset(code, ISSUER);
    let total = 0;
    let next = await server.accounts().forAsset(asset).limit(200).call();

    while (true) {
      next.records.forEach(acc => {
        const bal = acc.balances.find(
          b => b.asset_code === code && b.asset_issuer === ISSUER
        );
        if (bal) total += parseFloat(bal.balance);
      });
      if (next.records.length < 200 || !next.next) break;
      next = await next.next();
    }
    results[code] = total;
  }
  // Optionally, sum all assets for a combined TVL
  results['total_usd'] = Object.values(results).reduce((a, b) => a + b, 0);
  return results;
}

module.exports = {
  timetravel: false,
  methodology: 'Counts all circulating Excellar-issued assets by summing balances for each asset code.',
  stellar: { fetch }
};

