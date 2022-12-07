const sdk = require("@defillama/sdk");

const ethContracts = [
    /*** X7DAO LP - V2 Governance token */
    {
        lpAddress: '0x75311ee016c82e7770E4ACa73a0d142f96ddB969', erc20Address: '0x7105E64bF67ECA3Ae9b123F0e5Ca2b83b2eF2dA0'
    },
    /*** X7R LP - Merged Reward token */
    {
        lpAddress: '0x6139240A5907e4CE74673257c320ea366c521AEA', erc20Address: '0x70008F18Fc58928dcE982b0A69C2c21ff80Dca54'
    },
    /*** X7101 - V2 First of price consistent collection */
    {
        lpAddress: '0x81b786ED4B2F1118E0fa0343AD4760E15448e3e8', erc20Address: '0x7101a9392EAc53B01e7c07ca3baCa945A56EE105'
    },
    /*** X7102 - V2 Second of price consistent collection */
    {
        lpAddress: '0x49C838c60170C36E90CFA6021a57f2268dda3254', erc20Address: '0x7102DC82EF61bfB0410B1b1bF8EA74575bf0A105'
    },
    /*** X7103 - V2 Third of price consistent collection */
    {
        lpAddress: '0xcecf54EDC42c5C9f6Ee10cb1eFcc23E49F7D5A5d', erc20Address: '0x7103eBdbF1f89be2d53EFF9B3CF996C9E775c105'
    },
    /*** X7104 - V2 Fourth of price consistent collection */
    {
        lpAddress: '0x7d0D7c088233cBC08ee2400B96D10BF24C40E93a', erc20Address: '0x7104D1f179Cc9cc7fb5c79Be6Da846E3FBC4C105'
    },
    /*** X7105 - V2 Fifth of price consistent collection */
    {
        lpAddress: '0x6d9D1B6B4D53f090639ae8D9E9C83B796Da694eE', erc20Address: '0x7105FAA4a26eD1c67B8B2b41BEc98F06Ee21D105'
    },
];

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};
    const underlying = await sdk.api.abi.multiCall({
        calls: ethContracts.map(address => ({
            target: address.erc20Address,
            params: [address.lpAddress]
        })),
        abi: 'erc20:balanceOf',
        block,
    });

    sdk.util.sumMultiBalanceOf(balances, underlying);
    return balances;
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'The TVL consists of the underlying project tokens.',
    ethereum: {
        tvl,
    }
};