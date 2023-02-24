const { sumTokensExport } = require('../helper/unwrapLPs')

const bridgecontract = '0xc6895a02F9dFe64341c7B1d03e77018E24Db15eD';
const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const wbtc = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'

module.exports = {
  methodology: "Tracks funds locked in the Lago Bridge contract on Ethereum",
  ethereum: {
    tvl: sumTokensExport({ owner: bridgecontract, tokens: [usdc, wbtc,] })
  },
  hallmarks: [
    [Math.floor(new Date('2022-12-23') / 1e3), 'Project is winding down'],
  ],
};
