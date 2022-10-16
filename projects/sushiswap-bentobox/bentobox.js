const sdk = require("@defillama/sdk");
const { BigNumber } = require("ethers");
const { getChainTransform } = require("../helper/portedTokens");
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

    const bentoTokens = await getBentoboxTokensArray(chain); //array with shares and amount
    const tridentTokens = await getTridentTokens(chain); //mapping with amount
    const kashiTokens = await getKashiTokens(chain); //mapping with amount
    const furoTokens = await getFuroTokens(chain); //mapping with amount
    bentoTokens.map((token) => {
      let amount = BigNumber.from(token.rebase.elastic);
      if (tridentTokens[token.id]) {
        amount = amount.sub(tridentTokens[token.id]);
      }
      if (kashiTokens[token.id]) {
        amount = amount.sub(kashiTokens[token.id]);
      }
      if (furoTokens[token.id]) {
        amount = amount.sub(furoTokens[token.id]);
      }

      sdk.util.sumSingleBalance(balances, transform(token.id), amount);
    });

    return balances;
  };
}

module.exports = {
  bentobox,
  methodology: `TVL of BentoBox consist of tokens deposited into it minus Trident, Furo and Kashi TVL since they are built on it.`,
};
