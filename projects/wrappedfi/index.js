const sdk = require("@defillama/sdk");
const { getBlock } = require("../helper/getBlock");

const ethContracts = [
  /**
   * WCELO
   *
   * coingecko: wrapped-celo
   * coinmarketcap: wrapped-celo
  */
  '0xE452E6Ea2dDeB012e20dB73bf5d3863A3Ac8d77a',

  /**
   * WFIL
   *
   * coingecko: wrapped-filecoin
   * coinmarketcap: wrapped-filecoin
  */
  '0x6e1A19F235bE7ED8E3369eF73b196C07257494DE',

  /**
   * WCUSD
   *
   * coingecko: wrapped-celo-dollar
   * coinmarketcap: wrapped-celo-dollar
  */
  '0xad3E3Fc59dff318BecEaAb7D00EB4F68b1EcF195',

  /**
   * WZEC
   *
   * coingecko: wrapped-zcash
   * coinmarketcap: wrapped-zec
  */
  '0x4A64515E5E1d1073e83f30cB97BEd20400b66E10',

  /**
   * WLTC
   *
   * no price available for
   */
  '0x53c4871322Bb47e7A24136fce291a6dcC832a294',
];

const celoContracts = [
  /**
   * CETH
   *
   * no identifiers for coingecko or coinmarketcap
   */
  '0x2def4285787d58a2f811af24755a8150622f4361', // ceth

  /**
   * CBTC or WBTC
   *
   * no identifiers for coingecko or coinmarketcap
   */
  '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',
];

const ethTvls = ethContracts.map((contractAddress) => {
  return async (timestamp, block) => {
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
  return async (timestamp, ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, "celo", chainBlocks);

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
