const { fetchChain } = require("./brewlabs.js");

const chains = ["ethereum", "bsc", "polygon"];

module.exports = {
  url: "https://brewlabs.info",
  methodology: `Brewlabs is a Multi-Chain utility project responsible for a number of community tools and platforms within the cryptocurrency space.`,
  ...chains.map((chain) => [
    chain,
    {
      tvl: fetchChain(chain),
    },
  ]),
};
