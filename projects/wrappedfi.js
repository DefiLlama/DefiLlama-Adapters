const sdk = require("@defillama/sdk");

const ethContracts = [
  /**
   * WCELO
   *
   * coingecko: wrapped-celo
   * coinmarketcap: wrapped-celo
   */
  '0xE452E6Ea2dDeB012e20dB73bf5d3863A3Ac8d77a',

  /**
   * WCUSD
   *
   * coingecko: wrapped-celo-dollar
   * coinmarketcap: wrapped-celo-dollar
   */
  '0xad3E3Fc59dff318BecEaAb7D00EB4F68b1EcF195',

  /**
   * WFIL
   *
   * coingecko: wrapped-filecoin
   * coinmarketcap: wrapped-filecoin
   */
  '0x6e1A19F235bE7ED8E3369eF73b196C07257494DE',

  /**
   * WFLOW
   *
   * coingecko: wrapped-flow
   */
  '0x5c147e74d63b1d31aa3fd78eb229b65161983b2b',

  /**
   * WKDA
   *
   * coingecko: wrapped-kadena
   */
  '0x85d7bdfc9c3426b33a684241eeee70385bc42820',

  /**
   * WLTC
   *
   * no price available
   */
  '0x53c4871322Bb47e7A24136fce291a6dcC832a294',

  /**
   * WXRP
   *
   * coingecko: wrapped-xrp
   */
  '0x39fBBABf11738317a448031930706cd3e612e1B9',

  /**
   * WZEC
   *
   * coingecko: wrapped-zcash
   * coinmarketcap: wrapped-zec
   */
  '0x4A64515E5E1d1073e83f30cB97BEd20400b66E10'
];

const celoContracts = [
  /**
   * CBTC or WBTC
   *
   * no identifiers for coingecko or coinmarketcap
   */
  '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',

  /**
   * CETH
   *
   * no identifiers for coingecko or coinmarketcap
   */
  '0x2def4285787d58a2f811af24755a8150622f4361', // ceth
];

const ethTvls = ethContracts.map((contractAddress) => {
  return async (timestamp, block) => {
    if (contractAddress == '0x53c4871322Bb47e7A24136fce291a6dcC832a294') {
      return {
        litecoin: (
          await sdk.api.erc20.totalSupply({
            block,
            target: contractAddress,
          })
        ).output / 10 ** 18,
      }
    }
    return {
      [contractAddress]: (
        await sdk.api.erc20.totalSupply({
          block,
          target: contractAddress,
        })
      ).output,
    };
  };
});

const celoTvls = celoContracts.map((contractAddress) => {
  return async (timestamp, ethBlock, { celo: block }) => {
    return {
      [`celo:${contractAddress}`]: (
        await sdk.api.erc20.totalSupply({
          block,
          target: contractAddress,
          chain: "celo",
        })
      ).output,
    };
  };
});

module.exports = {
  ethereum: { tvl: sdk.util.sumChainTvls(ethTvls), },
  celo: { tvl: sdk.util.sumChainTvls(celoTvls), },
  methodology: 'The TVL consists of the underlying capital held in custody.'
};