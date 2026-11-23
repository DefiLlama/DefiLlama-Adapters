const { sumTokens } = require('../helper/chain/stellar')

// The accounts the Stellar Development Foundation lists on its mandate page,
// https://stellar.org/foundation/mandate, grouped by SDF as development, growth,
// product and innovation, and assets and liquidity
const OWNERS = [
  'GB6NVEN5HSUBKMYCE5ZOWSK5K23TBWRUQLZY3KNMXUZ3AQ2ESC4MY4AQ', // Direct Development, Available Funds
  'GATL3ETTZ3XDGFXX2ELPIKCZL7S5D2HY3VK4T7LRPD6DW5JOLAEZSZBA', // Direct Development (Hot 1)
  'GAKGC35HMNB7A3Q2V5SQU6VJC2JFTZB6I7ZW77SJSMRCOX2ZFBGJOCHH', // Direct Development (Hot 2)
  'GAPV2C4BTHXPL2IVYDXJ5PUU7Q3LAXU7OAQDP7KVYHLCNM2JTAJNOQQI', // Direct Development (Hot 3)
  'GC3ITNZSVVPOWZ5BU7S64XKNI5VPTRSBEXXLS67V4K6LEUETWBMTE7IH', // Growth Hot 1
  'GBEVKAYIPWC5AQT6D4N7FC3XGKRRBMPCAMTO3QZWMHHACLHTMAHAM2TP', // Growth 2
  'GDUY7J7A33TQWOSOQGDO776GGLM3UQERL4J3SPT56F6YS4ID7MLDERI4', // Growth 1
  'GCPWKVQNLDPD4RNP5CAXME4BEDTKSSYRR4MMEL4KG65NEGCOGNJW7QI2', // Product and Innovation 1
  'GDKIJJIKXLOM2NRMPNQZUUYK24ZPVFC6426GZAEP3KUK6KEJLACCWNMX', // Product and Innovation 2
  'GDWXQOTIIDO2EUK4DIGIBLEHLME2IAJRNU6JDFS5B2ZTND65P7J36WQZ', // Product and Innovation Hot 2
  'GAMGGUQKKJ637ILVDOSCT5X7HYSZDUPGXSUW67B2UKMG2HEN5TPWN3LQ', // Assets and Liquidity
  'GANII5Y2LABEBK74NWNKS4NREX2T52YTBGQDRDKVBFRIIF5VE4ORYOVY', // Assets and Liquidity (Hot)
]

// XLM is the Foundation's own token, so it is reported under ownTokens and everything else under tvl
const XLM = 'stellar:XLM'

async function balances(api) {
  return sumTokens({ api, owners: OWNERS })
}

async function tvl(api) {
  const all = await balances(api)
  delete all[XLM]
  return all
}

async function ownTokens(api) {
  const all = await balances(api)
  return { [XLM]: all[XLM] ?? 0 }
}

module.exports = {
  timetravel: false,
  methodology: 'Balances of the 12 accounts listed on the Stellar Development Foundation mandate page (stellar.org/foundation/mandate). XLM is reported as ownTokens; any other asset the accounts hold is reported as tvl.',
  stellar: { tvl, ownTokens },
}
