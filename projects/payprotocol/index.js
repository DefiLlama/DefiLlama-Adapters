const { sumTokensExport} = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json');

module.exports = {
    timetravel: false,
    misrepresentedTokens:false,
    methodology:"The projects' idle funds stored in the smart contracts could directly contribute to TVL, as well as the funds recharged from projects or platforms like GameFi and DePin projects. And through the Defi Legos combination, Pay Protocol not only helps projects earn interest on short-term idle funds but also makes the merchants' idle funds workaround and channel back to the DeFi ecosystem through smart contracts, which could result in TVL&liquidity increasing as well.",
    tron: {
        tvl: sumTokensExport({ 
          tokensAndOwners: [
            [ADDRESSES.tron.USDT, 'TU7YFtc7NC4wJRybjkHhRf8DX9ZDSBhSdK']
          ],
        }),
    }
};