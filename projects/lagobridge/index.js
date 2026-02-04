const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const bridgecontract = '0xc6895a02F9dFe64341c7B1d03e77018E24Db15eD';
const usdc = ADDRESSES.ethereum.USDC
const wbtc = ADDRESSES.ethereum.WBTC

module.exports = {
  methodology: "Tracks funds locked in the Lago Bridge contract on Ethereum",
  ethereum: {
    tvl: sumTokensExport({ owner: bridgecontract, tokens: [usdc, wbtc,], logCalls: true })
  },
  hallmarks: [
    ['2022-12-23', 'Project is winding down'],
  ],
};
