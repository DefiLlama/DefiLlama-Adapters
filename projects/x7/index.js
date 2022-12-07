const sdk = require("@defillama/sdk");

const ethContracts = [
    /**
    * X7DAO
    * V2 Governance token
    */
    '0x7105e64bf67eca3ae9b123f0e5ca2b83b2ef2da0',
    /**
    * X7R
    * Merged Reward token
    */
    '0x70008f18fc58928dce982b0a69c2c21ff80dca54',
    /**
    * X7101
    * V2 First of price consistent collection
    */
    '0x7101a9392eac53b01e7c07ca3baca945a56ee105',
    /**
    * X7102
    * V2 Second of price consistent collection
    */
    '0x7102dc82ef61bfb0410b1b1bf8ea74575bf0a105',
    /**
    * X7103
    * V2 Third of price consistent collection
    */
    '0x7103ebdbf1f89be2d53eff9b3cf996c9e775c105',
    /**
    * X7104
    * V2 Fourth of price consistent collection
    */
    '0x7104d1f179cc9cc7fb5c79be6da846e3fbc4c105',
    /**
    * X7105
    * V2 Fifth of price consistent collection
    */
    '0x7105faa4a26ed1c67b8b2b41bec98f06ee21d105',
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

module.exports = {
    ethereum: { tvl: sdk.util.sumChainTvls(ethTvls), },
    methodology: 'The TVL consists of the underlying project tokens.'
};