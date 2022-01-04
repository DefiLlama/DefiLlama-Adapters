const sdk = require("@defillama/sdk");
const erc20Abi = require("./erc20.json");
const BigNumber = require("bignumber.js");
const {
  getCohortTokensByChainName,
  getCohortsAndProxiesByChain,
  createMulticalls,
} = require("../helper/unifarm");
const { 
  transformBscAddress, 
  transformPolygonAddress 
} = require('../helper/portedTokens');
// node test.js projects/unifarm/index.js
const _tvl = async (timestamp, ethBlock, chainBlocks, chain, transform = a => a) => {
  const block = chainBlocks[chain];

  const tokens = await getCohortTokensByChainName(chain);
  const cohortAndProxies = await getCohortsAndProxiesByChain(chain);

  let calls = createMulticalls(cohortAndProxies, tokens);

  const multiCallResult = await sdk.api.abi.multiCall({
    abi: erc20Abi[0],
    calls,
    chain,
    block,
  });

  var balances = {};

  for (var e = 0; e < tokens.length; e++) {
    const token = tokens[e];
    const balancesArray = multiCallResult.output.filter((element) => {
      return (
        String(element.input.target).toLowerCase() ===
        String(token.address).toLowerCase()
      );
    });

    var cohortBalances = [];

    if (balancesArray[0] !== undefined) {
      let j = 0;
      while (j < balancesArray.length) {
        var x = new BigNumber(balancesArray[j].output);
        var parseBalance = Number(
          String(x.dividedBy(new BigNumber(10 ** token.decimals)))
        );
        if (Number(parseBalance) > 0) {
          cohortBalances.push(parseBalance);
        }
        j++;
      }
    }

    balances[transform(token.address)] = new BigNumber(
      cohortBalances.reduce((a, b) => a + b, 0)
    )
      .multipliedBy(new BigNumber(10).pow(token.decimals))
      .toFixed(0);
  }

  return balances;
};

const ethereum = async (timestamp, ethBlock, chainBlocks) => {
  let balance = await _tvl(timestamp, ethBlock, chainBlocks, "ethereum");
  return balance;
};

const bsc = async (timestamp, ethBlock, chainBlocks) => {
  const transform = await transformBscAddress();
  let balance = await _tvl(timestamp, ethBlock, chainBlocks, "bsc", transform);
  return balance;
};

const polygon = async (timestamp, ethBlock, chainBlocks) => {
  const transform = await transformPolygonAddress();
  let balance = await _tvl(timestamp, ethBlock, chainBlocks, "polygon", transform);
  return balance;
};

module.exports = {
  ethereum: {
    tvl: ethereum,
  },
  bsc: {
    tvl: bsc,
  },
  polygon: {
    tvl: polygon,
  },
  tvl: sdk.util.sumChainTvls([ethereum, bsc, polygon]),
  methodology: "We count tvl from the cohort contracts.",
};
