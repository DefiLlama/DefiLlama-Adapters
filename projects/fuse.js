/*==================================================
  Modules
  ==================================================*/

  const { GraphQLClient } = require('graphql-request')
  
  const BigNumber = require("bignumber.js")
  const utils = require('./helper/utils')
  
  /*==================================================
  Constants
  ==================================================*/
  const ambBridgeContract = "0xf301d525da003e874DF574BCdd309a6BF0535bb6"

  /*==================================================
  Methods
  ==================================================*/
  const bridgeClient = new GraphQLClient('https://graph.fuse.io/subgraphs/name/fuseio/fuse-ethereum-bridge')

  const fetchBridgedTokenPairs = async () => {
    const query = `{bridgedTokens {address, foreignAddress, symbol}}`
    const { bridgedTokens } = await bridgeClient.request(query)
    return bridgedTokens
  }

  async function fetch() {

    // Calculate the TVL locked in the amb bridge
    const tokenList = (await fetchBridgedTokenPairs()).map(({ foreignAddress }) => foreignAddress)
    var prices = await utils.getPricesFromContract(tokenList)

    var bridgeTVL = 0
    for (var key in tokenList) {
      if (tokenList[key] in prices.data)
      {
        var balances = await utils.returnBalance(tokenList[key], ambBridgeContract)
        bridgeTVL += (parseFloat(balances) * prices.data[tokenList[key]].usd)
      }
    }

    // Calculate the TVL of fuse on the fusenetwork
    var circulatingFuse = await utils.fetchURL('https://bot.fuse.io/api/v1/stats/circulating')
    var lockedOnFuse = circulatingFuse.data.onFuseNetwork + circulatingFuse.data.staked
    var fusePriceString = await utils.getPricesfromString("fuse-network-token")
    var fusePrice = fusePriceString.data["fuse-network-token"].usd
    var fuseTVL = fusePrice * lockedOnFuse

    var TVL = fuseTVL + bridgeTVL

    return TVL;
  }

  module.exports = {
    fetch
  }