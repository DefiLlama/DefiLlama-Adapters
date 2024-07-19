const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');

async function tvl(api) {
    const ownerAddress = "0xA905f9f0b525420d4E5214E73d70dfFe8438D8C8";
    const tokensAndOwners = [
        ["0xb2f30a7c980f052f02563fb518dcc39e6bf38175", "0xD842D9651F69cEBc0b2Cffc291fC3D3Fe7b5D226"],
        [ADDRESSES.ethereum.SNX, ownerAddress],
        ["0xba100000625a3754423978a60c9317c58a424e3D", ownerAddress],
        [ADDRESSES.ethereum.CRV, ownerAddress,],
        [ADDRESSES.ethereum.CVX, ownerAddress,],
        ["0xD842D9651F69cEBc0b2Cffc291fC3D3Fe7b5D226", ownerAddress,]
    ];

    const balances = await sumTokens2({ api, tokensAndOwners })

    const tokens = await api.call({
        target: "0xb688801cadb4ddb6980bb777d42972c24f920855",
        abi: "address[]:getEnabledTokens"
    })
    const deposited = await api.multiCall({
        abi: "function tokenTotalDeposited(address _tokenAddress) external view returns (uint256 _totalDeposited)",
        calls: tokens.map(i => ({ target: "0xb688801cadb4ddb6980bb777d42972c24f920855", params: [i] }))
    })
    tokens.forEach((element, i) => {
        balances[element] = deposited[i]
    });

    return balances
}

module.exports = {
    methodology: 'Coins deposited as collateral and snxUSD',
    ethereum: {
        tvl
    },
}
