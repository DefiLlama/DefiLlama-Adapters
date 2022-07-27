const { sumTokens2, } = require("../helper/unwrapLPs")
const { request } = require("graphql-request");
const { get, } = require("../helper/http")
const sdk = require('@defillama/sdk')
const { getChainTransform } = require('../helper/portedTokens')
const { getUniqueAddresses } = require('../helper/utils')
const BigNumber = require("bignumber.js");

const tokenAddress = 'https://defi-llama-feed.vercel.app/api/address'
const config = {
  ethereum: {
    holder: '0xA81bd16Aa6F6B25e66965A2f842e9C806c0AA11F',
    graph: 'https://api.thegraph.com/subgraphs/name/revest-finance/revest-mainnet-subgraph',
    chainId: 1,
    revest: '0x120a3879da835a5af037bb2d1456bebd6b54d4ba',
  },
  polygon: {
    holder: '0x3cCc20d960e185E863885913596b54ea666b2fe7',
    chainId: 137,
  },
  fantom: {
    holder: '0x3923E7EdBcb3D0cE78087ac58273E732ffFb82cf',
    graph: 'https://api.thegraph.com/subgraphs/name/revest-finance/revestfantomtvl',
    chainId: 250,
  },
  avax: {
    holder: '0x955a88c27709a1EEf4ACa0df0712c67B48240919',
    chainId: 43114,
  },
}

const tokenTrackersABI = {
  "inputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "name": "tokenTrackers",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "lastBalance",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "lastMul",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}


module.exports = {
  hallmarks: [
    [1648339200, "Reentrancy attack"]
],
  methodology: "We list all tokens in our vault and sum them together",
};


Object.keys(config).forEach(chain => {
  const { chainId, holder, revest, graph, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      const blacklist = []
      if (revest) blacklist.push(revest.toLowerCase())
      const transform = await getChainTransform(chain)
      const tokenURL = `${tokenAddress}?chainId=${chainId}`
      let { body: tokens } = await get(tokenURL)
      tokens = getUniqueAddresses(tokens).filter(t => !blacklist.includes(t)) // filter out staking and LP tokens
      const balances = await sumTokens2({ chain, block, owner: holder, tokens, resolveLP: true })
      if (!graph) return balances
      return queryGraph(graph, tokens, transform, balances)
    },
  }

  if (revest)
    module.exports[chain].staking = async (_, _b, { [chain]: block }) => {
      const transform = await getChainTransform(chain)
      const balances = await sumTokens2({ chain, block, owner: holder, tokens: [revest] })
      if (!graph) return balances
      return queryGraph(graph, [revest], transform, balances)
    }
})


async function queryGraph(graph_api, tokens, transform, balances) {
  //for each token we care about in the array
  for (let i = 0; i < tokens.length; i++) {
    let totalBalance = 0;
    let skipAmount = 0;
    let objReturned = 0;

    do {
      const tokensQuery = `
      query {
        tokenVaultInteractions (
            where: {
              token: \"${tokens[i]}"
            }
            skip: ${skipAmount}
        ) {
          isDeposit
          amountTokens
        }
      }
    `;

      const data = await request(graph_api, tokensQuery)

      for (let y = 0; y < data.tokenVaultInteractions.length; y++) {
        let bal = +data.tokenVaultInteractions[y].amountTokens;
        if (data.tokenVaultInteractions[y].isDeposit == true) {
          // console.log(Number(ethers.utils.formatEther(data.tokenVaultInteractions[y].amountTokens)))
          totalBalance += bal;
        } else {
          totalBalance -= bal;
        }
      }

      // console.log(`Length: ${data.tokenVaultInteractions.length}`)
      skipAmount += 100;
      objReturned = data.tokenVaultInteractions.length;
    } while (objReturned != 0);
    // console.log(`Total Balance ${tokens[i]}: ${totalBalance}`)
    if (totalBalance < 0) {
      // throw new Error('balance should never be zero  token: ' + tokens[i] + totalBalance)
      console.log('balance should never be zero  token: ' + tokens[i] + totalBalance)
      totalBalance = 0
    }
    sdk.util.sumSingleBalance(balances, transform(tokens[i]), BigNumber(totalBalance).toFixed(0))
  }
  return balances;
}
