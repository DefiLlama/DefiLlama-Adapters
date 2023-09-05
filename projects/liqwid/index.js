const { sumTokensExport } = require('../helper/chain/cardano');
const { graphQuery } = require('../helper/http');

module.exports = {
  cardano: {
    // tvl: sumTokensExport({ scripts: scriptAddresses, }),
    tvl,
    borrowed,
    staking: sumTokensExport({ scripts: ["addr1w8arvq7j9qlrmt0wpdvpp7h4jr4fmfk8l653p9t907v2nsss7w7r4"], }),
    methodology: 'Adds up the Ada in the 16 action tokens and batch final token.'
  }
};


const endpoint = 'https://api.liqwiddev.net/graphql'

const query = `{
  markets {
    asset {
      marketId
      name
    }
    totalSupply
    marketId
    decimals
    qTokenId
    qTokenPolicyId
    utilization
    market {
      params {
        underlyingClass {
          value0 {
            symbol
            name
          }
        }
      }
      scripts {
        actionToken {
          script {
            value0 {
              value0
            }
          }
        }
      }
    }
  }
}`
const tokenMapping = {
  ADA: 'lovelace',
  DJED: '8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61446a65644d6963726f555344',
  USDC: '25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff93555534443',
}

const getToken = market => tokenMapping[market.marketId.toUpperCase()] ?? base64ToHex(market.market.params.underlyingClass.value0.symbol)


async function tvl(_, _b, _cb, { api, }) {
  const { markets } = await graphQuery(endpoint, query)

  markets.forEach(market => api.add(getToken(market), market.totalSupply))
}

async function borrowed(_, _b, _cb, { api, }) {
  const { markets } = await graphQuery(endpoint, query)

  markets.forEach(market => {
    const utilization = market.utilization
    const availability = 1 - utilization
    const totalBorrowed = market.totalSupply * utilization / availability
    api.add(getToken(market), totalBorrowed)
  })
}

function base64ToHex(base64) {
  // Step 1: Decode the Base64 string to a byte array
  const binaryData = atob(base64);

  // Step 2: Convert each byte to its hexadecimal representation
  const hexArray = [];
  for (let i = 0; i < binaryData.length; i++) {
    const byte = binaryData.charCodeAt(i).toString(16).padStart(2, '0');
    hexArray.push(byte);
  }

  // Step 3: Concatenate the hexadecimal values to form the final hexadecimal string
  return hexArray.join('');
}
