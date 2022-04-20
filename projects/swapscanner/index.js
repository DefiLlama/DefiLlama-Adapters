const { sumTokens } = require("../helper/unwrapLPs");
const { getFixBalances } = require("../helper/portedTokens");
const { default: BigNumber } = require("bignumber.js");
const sdk = require("@defillama/sdk");

const chain = "klaytn";

const SCNR = {
  address: "0x8888888888885b073f3c81258c27e83db228d5f3",
  staking: "0x7c59930d1613ca2813e5793da72b324712f6899d",
  LPs: {
    KLAY: "0xe1783a85616ad7dbd2b326255d38c568c77ffa26",
  },
};

const WKLAY = "0xd7a4d10070a4f7bc2a015e78244ea137398c3b74";
const transformedSCNR = `klaytn:${SCNR.address}`;
const transformedWKLAY = `klaytn:${WKLAY}`;

const tvl = async () => ({});

const staking = async (_ts, _block, chainBlocks) => {
  const block = chainBlocks[chain];
  const fixBalances = await getFixBalances(chain);
  const { balances, price } = await getTokenPrice(block);
  sdk.util.sumSingleBalance(
    balances,
    transformedWKLAY,
    BigNumber(balances[transformedSCNR]) //
      .multipliedBy(price)
      .toFixed(0)
  );
  fixBalances(balances);
  return balances;
};

const pool2 = async (_ts, _block, chainBlocks) => {
  const block = chainBlocks[chain];
  const fixBalances = await getFixBalances(chain);

  const balances = {};
  await sumTokens(
    balances,
    [[SCNR.address, SCNR.staking]],
    block,
    chain,
    undefined,
    { resolveLP: true }
  );
  const { price } = await getTokenPrice(block);
  sdk.util.sumSingleBalance(
    balances,
    transformedWKLAY,
    BigNumber(balances[transformedSCNR]) //
      .multipliedBy(price)
      .toFixed(0)
  );

  fixBalances(balances);
  return balances;
};

let priceCache;
async function getTokenPrice(block) {
  if (!priceCache) priceCache = _call();
  return priceCache;

  async function _call() {
    const balances = {};
    await sumTokens(
      balances,
      [[SCNR.LPs.KLAY, SCNR.staking]],
      block,
      chain,
      undefined,
      { resolveLP: true }
    );
    return {
      price: BigNumber(balances[transformedWKLAY]) //
        .dividedBy(balances[transformedSCNR]),
      balances,
    };
  }
}

module.exports = {
  klaytn: {
    tvl,
    staking,
    pool2,
  },
};
