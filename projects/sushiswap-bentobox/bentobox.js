const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const { getChainTransform } = require("../helper/portedTokens");
const { getBlock } = require("../helper/http");
const {
  getFuroTokens,
  getKashiTokens,
  getTridentTokens,
  getBentoboxTokensArray,
} = require("./helper");

function bentobox(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    const transform = await getChainTransform(chain);
    let block = await getBlock(timestamp, chain, chainBlocks)
    block = block - 1000;

    const bentoTokens = await getBentoboxTokensArray(chain, block); //array with shares and amount
    const tridentTokens = await getTridentTokens(chain, block); //mapping with amount
    const kashiTokens = await getKashiTokens(chain, block); //mapping with amount
    const furoTokens = await getFuroTokens(chain, block); //mapping with amount
    bentoTokens.map((token) => {
      if (token.symbol === 'MIM') return;
      let amount = BigNumber(token.rebase.elastic);
      if (tridentTokens[token.id]) {
        amount = amount.minus(+tridentTokens[token.id]);
      }
      if (kashiTokens[token.id]) {
        amount = amount.minus(+kashiTokens[token.id]);
      }
      if (furoTokens[token.id]) {
        amount = amount.minus(+furoTokens[token.id]);
      }

      sdk.util.sumSingleBalance(balances, transform(token.id), amount.toFixed(0));
    });

    return balances;
  };
}

module.exports = {
  bentobox,
  methodology: `TVL of BentoBox consist of tokens deposited into it minus Trident, Furo and Kashi TVL since they are built on it and already listed on DefiLlama.`,
};
