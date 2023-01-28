const sdk = require("@defillama/sdk");
const PINA_TOKEN_CONTRACT = "0x02814F435dD04e254Be7ae69F61FCa19881a780D";
const PINA_DAO_CONTRACT = "0xd50B9219C832a762dd9a6929Dc4FeF988f65175b";
const PINA_LP_CONTRACT = "0x03083F4fE89b899C7887E26bE3E974EbBa11E591";
const PINA_DONTDIEMEME_CONTRACT = "0xe0bE1793539378cb87b6d4217E7878d53567bcfb";
const PINA_USDC_LP_CONTRACT = "0x58624E7a53700cb39772E0267ca0AC70f064078B";
const PINA_MEME_LP_CONTRACT = "0x713afa49478f1a33c3194ff65dbf3c8058406670";

async function tvl(_, _1, _2, { api }) {
  const balances = {};

  const daoBalance = await api.call({
    abi: "erc20:balanceOf",
    target: PINA_TOKEN_CONTRACT,
    params: [PINA_DAO_CONTRACT],
  });

  const dontdiememeBalance = await api.call({
    abi: "erc20:balanceOf",
    target: PINA_TOKEN_CONTRACT,
    params: [PINA_DONTDIEMEME_CONTRACT],
  });

  const pinausdcSupply = await api.call({
    abi: "erc20:totalSupply",
    target: PINA_USDC_LP_CONTRACT,
  });

  const pinausdcdaoBalance = await api.call({
    abi: "erc20:balanceOf",
    target: PINA_USDC_LP_CONTRACT,
    params: [PINA_LP_CONTRACT],
  });

  const pinausdclpBalance = await api.call({
    abi: "erc20:balanceOf",
    target: PINA_TOKEN_CONTRACT,
    params: [PINA_USDC_LP_CONTRACT],
  });

  const pinausdcdao =
    (2 * (pinausdclpBalance * pinausdcdaoBalance)) / pinausdcSupply;

  const pinamemeSupply = await api.call({
    abi: "erc20:totalSupply",
    target: PINA_MEME_LP_CONTRACT,
  });

  const pinamemedaoBalance = await api.call({
    abi: "erc20:balanceOf",
    target: PINA_MEME_LP_CONTRACT,
    params: [PINA_LP_CONTRACT],
  });

  const pinamemelpBalance = await api.call({
    abi: "erc20:balanceOf",
    target: PINA_TOKEN_CONTRACT,
    params: [PINA_MEME_LP_CONTRACT],
  });

  const pinamemedao =
    (2 * (pinamemelpBalance * pinamemedaoBalance)) / pinamemeSupply;

  await sdk.util.sumSingleBalance(
    balances,
    PINA_TOKEN_CONTRACT,
    daoBalance,
    api.chain
  );

  await sdk.util.sumSingleBalance(
    balances,
    PINA_TOKEN_CONTRACT,
    pinausdcdao,
    api.chain
  );

  await sdk.util.sumSingleBalance(
    balances,
    PINA_TOKEN_CONTRACT,
    pinamemedao,
    api.chain
  );

  await sdk.util.sumSingleBalance(
    balances,
    PINA_TOKEN_CONTRACT,
    dontdiememeBalance,
    api.chain
  );

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "counts the number of tokens in Pina pool",
  start: 1673928000,
  ethereum: {
    tvl,
  },
};
