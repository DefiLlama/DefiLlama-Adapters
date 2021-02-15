const retry = require('async-retry')
const axios = require("axios");
const {GraphQLClient, gql} = require('graphql-request')
const BigNumber = require("bignumber.js");

async function fetch() {
      const endpoint = 'https://xapi3.fantom.network/api'
      const graphQLClient = new GraphQLClient(endpoint)

      const query = gql`
          query getToken($token: Address!) {
              erc20Token(token: $token) {
                  address
                  name
                  symbol
                  decimals
                  totalSupply
                  totalDeposit
                  totalDebt
              }
          }
          `;

      var tokens = [
          {
              address: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
              symbol: 'WFTM',
          },
          {
              address: '0x69c744d3444202d35a2783929a0f930f2fbb05ad',
              symbol: 'SFTM',
          },
          {
              address: '0xad84341756bf337f5a0164515b1f6f993d194e1f',
              symbol: 'FUSD',
          }
      ]

      let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=fantom&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))

      const wData = await graphQLClient.request(query, {token: tokens[0].address});
      const sData = await graphQLClient.request(query, {token: tokens[1].address});
      const fData = await graphQLClient.request(query, {token: tokens[2].address});

      let tvl = new BigNumber(wData.erc20Token.totalDeposit).plus(new BigNumber(sData.erc20Token.totalDeposit)).div(10 ** 18).toNumber();
      const result = ((tvl * price_feed.data.fantom.usd) + (new BigNumber(fData.erc20Token.totalSupply)).div(10 ** 18).toNumber()).toFixed(2);
      /*const json = {
        wFTM : {
          description : 'Wrapped FTM',
          amount : new BigNumber(wData.erc20Token.totalSupply).div(10 ** 18).toNumber(),
          collateral : new BigNumber(wData.erc20Token.totalDeposit).div(10 ** 18) * price_feed.data.fantom.usd,
          usd : new BigNumber(wData.erc20Token.totalSupply).div(10 ** 18) * price_feed.data.fantom.usd
        },
        sFTM : {
          description : 'Liquid staking FTM',
          amount : new BigNumber(sData.erc20Token.totalSupply).div(10 ** 18).toNumber(),
          collateral : new BigNumber(sData.erc20Token.totalDeposit).div(10 ** 18) * price_feed.data.fantom.usd,
          usd : new BigNumber(sData.erc20Token.totalSupply).div(10 ** 18) * price_feed.data.fantom.usd
        },
        fUSD : {
          description : 'Fantom USD',
          amount : new BigNumber(fData.erc20Token.totalSupply).div(10 ** 18).toNumber(),
          usd : new BigNumber(fData.erc20Token.totalSupply).div(10 ** 18).toNumber()
        },
        price : price_feed.data.fantom.usd,
        collateral_usd : (tvl * price_feed.data.fantom.usd),
        tvl,
        result
      }
      console.log(json)*/
      return result;
}

module.exports = {
    fetch
}
