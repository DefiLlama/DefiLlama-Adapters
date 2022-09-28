const sdk = require("@defillama/sdk");

const fliperinoContractETHW = "0xFFE6280ae4E864D9aF836B562359FD828EcE8020";


const Tvl = async (timestamp, ethBlock, chainBlocks) => {
  const balance = sdk.api.eth.getBalance(fliperinoContractETHW,ethBlock,18,'ethpow');
  return balance;
};

console.log(Tvl)

module.exports = {
  timetravel: true,
  ethpow: {
    tvl: Tvl,
  },
};
