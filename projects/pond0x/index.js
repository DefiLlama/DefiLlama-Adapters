const { staking } = require("../helper/staking");
const { getTokenSupplies } = require('../helper/solana');


const ETH_STAKING_CONTRACT = "0xed96E69d54609D9f2cFf8AaCD66CCF83c8A1B470";
const PONDOX_ETH = "0x423f4e6138e475d85cf7ea071ac92097ed631eea";

const WPOND_SOLANA_MINT = "3JgFwoYV74f6LwWjQWnr3YDPFnmBdwQfNyubv99jqUoq";

const COINGECKO_ID = "pond-coin";

async function solanaTVL(api) {
  await getTokenSupplies([WPOND_SOLANA_MINT], api);

  const solanaKey = `solana:${WPOND_SOLANA_MINT}`;
  const rawBalance = api.getBalances()[solanaKey];

  if (rawBalance) {
    const tokenAmount = Number(rawBalance) / 1e3;
    
    api.addCGToken(COINGECKO_ID, tokenAmount);
    
    delete api.getBalances()[solanaKey];
  }
}


module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking(ETH_STAKING_CONTRACT, PONDOX_ETH)
  },
  solana: {
    tvl: () => ({}),
    staking: solanaTVL
  }
};
