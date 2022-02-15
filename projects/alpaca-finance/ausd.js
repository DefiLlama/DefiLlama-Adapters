const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const axios = require("axios");

async function getProcolAUSDAddresses(chain) {
  if(chain == 'bsc') {
    return (
      await axios.get(
        "https://raw.githubusercontent.com/alpaca-finance/alpaca-stablecoin/main/.mainnet.json"
      )
    ).data;
  }
}

async function calAusdTvl(chain, block) {
  /// @dev Initialized variables
  const balances = {};

  const ausdAddresses = await getProcolAUSDAddresses(chain);

  /// @dev getting total supply ausd
  const ausdTVL = (
    await sdk.api.abi.multiCall({
      block,
      abi: abi.ausdTotalStablecoinIssued,
      calls: [
        {
          target: ausdAddresses["BookKeeper"].address,
        },
      ],
      chain,
    })
  ).output;
  const base = new BigNumber(10);
  const balanceAUSDTVL = new BigNumber(ausdTVL[0].output).dividedBy(
    base.exponentiatedBy(27)
  );
  const ausdAddress = ausdAddresses["AlpacaStablecoin"]["AUSD"].address;
  balances[`${chain}:${ausdAddress}`] = balanceAUSDTVL.toFixed(0);

  return balances;
}

module.exports = {
  calAusdTvl
}