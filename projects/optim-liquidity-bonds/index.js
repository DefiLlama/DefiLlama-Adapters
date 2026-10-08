const { sumTokensExport } = require('../helper/chain/cardano')

// payment credentials (bech32 script hashes): each bond/pool/vault UTxO carries a different stake part, so they are queried by credential, not by address
const scripts = [
  // liquidity bonds: bond validators, lender ADA locked in issued bonds
  'script15plzrmq39wwa9cvjw7zy7aqycn8ak6jlej7gcsnj5xe26unnlyp',
  'script1r53epw45fa3x0sq523tdct6l3639sm7tp2k6c4f9mxjqvrt0cek',
  // liquidity bonds: per-offer pool validators, lender ADA waiting to fund a bond
  'script18f4hlq89uk43qkju5mlruy69vzz0l4930k2q3f30u9e05elgsml',
  'script1gfyssard8n8a2petps3ep6ndrgnuhp9gmgt5u97zg2dvjcqu6ja',
  'script1ck008g9tund0eyfhyvppaclytnfrsn0nwc67r35mgqefvcr34xg',
  'script1lrm48jdvaxncehwjydn2l7wrvx83wm7av7frzut6z4dak8xtu5u',
  'script1yuu8udwjleva6j2kdqw9t3tauv7wftwcu9fgt244vx7tqlez7nm',
  'script1dst7vhwp6m755nlmp7ngdddpuf92s9m3hfqdd30pf0uu22n2p4n',
  'script15jh5sl8kfwht9dkrnzjpztaf7t6vs3n2vzlhwfzaey47zfr5333',
  'script1nuyzrfx9uxusxmyjwjpcslypcv2slldvv986qwhtv894whxvshc',
  'script1ldq3yhgppv005g3wa269653j3aqvj6geglyk0e9a5z045mmpt2x',
  'script1y20vcxsdcu5kfaw065m6j4t2n83dxnn6rp4w75effwllwcpynmq',
  'script129dzzmy8s35hptktn4tq2q2v2whz5l5vt30029ltraswcqz5y92',
  'script1nvw24vvjdat43p7gc75nm8f3s8h9ezht3j8m56ny7s29vgvv2j5',
  'script1s2nchqddyv5qwnnypc8wrc63h68l0wkkq8xgr34e834mkzdjtpp',
  'script1qh83dw08xdc8s2mjayhn8c7g7d47a5mqwj6ly3es4f6zxpa4ekc',
  'script1vr0aesy7edh90yl8tnmyrua7lznlwuujemytuhye9lp7wkj7pez',
  // OADA v2: vault and staking strategy validators backing OADA/sOADA
  'script1t57ln870h0eg90tk50tk5t3shhfzucw9du2xy3re8zfnk6pgenc',
  'script1793v28s7qgss7zy5ujnjeskxzdc9pq87y07903gwd5ln6mvg5zy',
  'script12nn8adscy06atypxlt9jeawz587jzmhc4xnylatkzug0jyfyjhz',
]

module.exports = {
  timetravel: false,
  methodology: 'ADA locked in the Liquidity Bonds bond and pool contracts plus the OADA v2 vault and staking strategy contracts, read on-chain by payment credential. OADA and protocol tokens held by the contracts are excluded.',
  hallmarks: [['2026-09-13', 'OADA paused after Splash pool exploit, liquidity pulled']],
  cardano: {
    tvl: sumTokensExport({ scripts, tokens: ['lovelace'] }),
  },
};
