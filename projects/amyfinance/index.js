const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { transformArbitrumAddress } = require("../helper/portedTokens");
const { getBlock } = require("../helper/getBlock");

const tokens = [
  ["0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", false], //USDC
  ["0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", false], //USDT
  ["0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", false], //DAI
  ["0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", false], //WBTC
  ["0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", false], //WETH
  ["0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0", false], //UNI
  ["0xf97f4df75117a78c1A5a0DBb814Af92458539FB4", false], //LINK
  ["0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A", false], //MIM
  ["0xd4d42F0b6DEF4CE0383636770eF773390d85c61A", false], //SUSHI
];
const aibContracts = [
  "0xe76a422C30B09f8d20ad5d8A9D21206835F6c692", //aibUSDC
  "0xE3575B6226a7965f5289C2C6eF2f9C89b6d70941", //aibUSDT
  "0xa6F7A3e16fFC0fE08C43e72C5BB5E15d98c79a05", //aibDAI
  "0x2b3554d6810FA2CEc563b0bC731AbAC60A717f3B", //aibWBTC
  "0x8C1b5FE3A884118569707d07049fbc56A8314CcE", //aibWETH
  "0xE85B64dDA773CB18E0F2a2211Da60DaA536C0284", //aibUNI
  "0x9Dd192fca6A1E7c8a3C014a35087dE3fb9Da14E5", //aibLINK
  "0x381F8482ee0a12202F2A3735370859f5709B12d2", //aibMIM
  "0x52444Aa321dfD7b24aA263Af6F7DCC26565f3629", //aibSUSHI
];

async function tvl(timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, "arbitrum", chainBlocks);
  let balances = {};
  const transformAdress = await transformArbitrumAddress();

  await sumTokensAndLPsSharedOwners(
    balances,
    tokens,
    aibContracts,
    block,
    "arbitrum",
    transformAdress
  );
  return balances;
}

module.exports = {
  tvl,
};
