const { fetchURL } = require("../helper/utils");
const {
  transformPolygonAddress,
  transformBscAddress,
} = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const UnilendContract = "0x13A145D215182924c89F2aBc7D358DCc72F8F788";

const API_URL = "https://unilend.finance/list.json";

const calcTvl = async (balances, Id, block, chain, transformAddr) => {
  const tokenList = (await fetchURL(API_URL)).data.tokens
    .filter((CHAIN) => CHAIN.chainId == Id)
    .map((token) => token.address);

  for (const token of tokenList) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [[token, false]],
      [UnilendContract],
      block,
      chain,
      transformAddr
    );
  }
};

const ethTvl = async () => {
  const balances = {};

  await calcTvl(balances, 1);

  return balances;
};

const polygonTvl = async (chainBlocks) => {
  const balances = {};

  const transformAddress = await transformPolygonAddress();
  await calcTvl(
    balances,
    137,
    chainBlocks["polygon"],
    "polygon",
    transformAddress
  );

  return balances;
};

const bscTvl = async (chainBlocks) => {
  const balances = {};

  const transformAddress = await transformBscAddress();
  await calcTvl(balances, 56, chainBlocks["bsc"], "bsc", transformAddress);

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  bsc: {
    tvl: bscTvl,
  },
  methodology:
    "We count liquidity on the Pools through UnilendFlashLoansCore Contract",
};
