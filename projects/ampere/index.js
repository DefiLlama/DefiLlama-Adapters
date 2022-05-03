const sdk = require("@defillama/sdk");

const { default: request, gql } = require("graphql-request");
const { default: BigNumber } = require("bignumber.js");
const { FUSE_ON_ETH, CHAIN, AMP, CURRENT, fuseLPs } = require("./constants");
const { ampFuseLp, currentFuseLp, current, amp } = require("./contracts");
const { tombTvl } = require("../helper/tomb");

const rewardPool = "0x8Cdc3584B455b49634b9272247AD2AccEef58c98".toLowerCase();
const masonry = "0x335C392DB4F0AD43f782B0646959E41FC1134350".toLowerCase();
const treasury = "0x8c3360Ff9e7651c2e4902dde31d772E8dD58a9B0".toLowerCase();
const genesisBlock = 1650700800;

async function calcPool2(masterchef, lps, block, chain) {
  const ampFuseBalance = await ampFuseLp.functions.balanceOf(masterchef);
  const currentFuseBalance = await currentFuseLp.functions.balanceOf(
    masterchef
  );
  const lpPositions = {
    [lps[0]]: ampFuseBalance,
    [lps[1]]: currentFuseBalance,
  };

  let pairs;
  try {
    const blockHeight = { number: parseInt(block.number) };
    const response = await request(exchangeURL, pairsTimeTravelQuery, {
      pairAddresses: lps,
      block: blockHeight,
    });
    pairs = response.pairs;
  } catch (e) {
    console.log(`Failed to get data for LP token on chain ${chain}`);
    throw e;
  }

  let balances = {};
  for (const pair of pairs) {
    const { reserve0, reserve1, totalSupply, token0, token1 } = pair;

    let listedToken;
    let listedTokenBalance;
    if (token0.id === CURRENT || token0.id === AMP) {
      listedToken = token1.id;
      listedTokenBalance = reserve1;
    } else if (token1.id === CURRENT || token1.id === AMP) {
      listedToken = token0.id;
      listedTokenBalance = reserve0;
    }
    const balance = BigNumber(lpPositions[pair.id])
      .times(listedTokenBalance)
      .div(totalSupply)
      .times(2)
      .toFixed(0);

    sdk.util.sumSingleBalance(balances, FUSE_ON_ETH, balance);
  }

  return balances;
}

async function fusePool2(timestamp, block, chainBlocks) {
  const { blocks } = await request(blockURL, latestBlockQuery);
  const latest = blocks[4];

  return await calcPool2(rewardPool, fuseLPs, latest, CHAIN);
}

async function calcStaking(timestamp, block, chainBlocks) {
  const balance = await current.functions.balanceOf(masonry);
  const { token: currentToken } = await request(exchangeURL, tokenPriceQuery, {
    id: CURRENT,
  });

  return {
    [FUSE_ON_ETH]: BigNumber(balance)
      .times(BigNumber(currentToken.derivedETH))
      .toFixed(0),
  };
}

async function calcTreasury(timestamp, block, chainBlocks) {
  const balance = await amp.functions.balanceOf(treasury);
  const { token: ampToken } = await request(exchangeURL, tokenPriceQuery, {
    id: AMP,
  });

  return {
    [FUSE_ON_ETH]: BigNumber(balance)
      .times(BigNumber(ampToken.derivedETH))
      .toFixed(0),
  };
}

const blockURL = "https://api.thegraph.com/subgraphs/name/fuseio/fuse-blocks";
const exchangeURL =
  "https://api.thegraph.com/subgraphs/name/voltfinance/voltage-exchange";

const latestBlockQuery = gql`
  query latestBlockQuery {
    blocks(
      first: 5
      skip: 0
      orderBy: number
      orderDirection: desc
      where: { number_gt: 2486000 }
    ) {
      id
      number
      timestamp
    }
  }
`;

const pairsTimeTravelQuery = gql`
  query pairsTimeTravelQuery(
    $first: Int! = 1000
    $pairAddresses: [Bytes]!
    $block: Block_height!
  ) {
    pairs(
      first: $first
      block: $block
      orderBy: trackedReserveETH
      orderDirection: desc
      where: { id_in: $pairAddresses }
    ) {
      id
      reserve0
      reserve1
      totalSupply
      token0 {
        id
        decimals
      }
      token1 {
        id
        decimals
      }
      token0Price
      token1Price
    }
  }
`;

const tokenPriceQuery = gql`
  query tokenPriceQuery($id: String) {
    token(id: $id) {
      derivedETH
    }
  }
`;

module.exports = {
  methodology:
    "Pool2 deposits consist of TOMB/FTM and TSHARE/FTM LP tokens deposits while the staking TVL consists of the TSHARES tokens locked within the Masonry contract(0x8764de60236c5843d9faeb1b638fbce962773b67).",
  timetravel: false,
  misrepresentedTokens: true,
  start: genesisBlock,
  fuse: {
    tvl: async () => ({}),
    pool2: fusePool2,
    staking: calcStaking,
    treasury: calcTreasury,
  },
};

// module.exports = {
//   ...tombTvl(ampTokenAddress, currentTokenAddress, currentRewardPoolAddress, masonryAddress, fuseLPs, "fuse", undefined, false, fuseLPs[1])
// }
