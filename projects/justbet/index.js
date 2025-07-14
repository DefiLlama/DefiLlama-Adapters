const ADDRESSES = require('../helper/coreAssets.json')
const { vaultAdapterAbi } = require('./abis')
const { sumTokens2 } = require("../helper/unwrapLPs");

const WINR_LOCKV2_CONTRACT = "0x7f3E35B41BDF7DBA6a90661918d0EfDDC6C15c3C";
const WINR_VAULT_ADAPTER_CONTRACT = "0xc942b79E51fe075c9D8d2c7501A596b4430b9Dd7";

const JUSTBET_BANKROLL_INDEXES = [
    ADDRESSES.linea.WETH_1,
    '0x0000000000000000000000000000000000000006',
    '0x0000000000000000000000000000000000000013',
    '0x0000000000000000000000000000000000000014',
    '0x0000000000000000000000000000000000000015',
    '0x0000000000000000000000000000000000000019'
];

const tvl = async (api) => {
    const poolsDetails = await api.call({
            abi: vaultAdapterAbi,
            target: WINR_VAULT_ADAPTER_CONTRACT,
            params: [JUSTBET_BANKROLL_INDEXES]
        })

    const tokensAndOwners = [
        [ADDRESSES.null, WINR_LOCKV2_CONTRACT], 
        ...poolsDetails.vaultDetails_.map(d => [d.bankrollTokenAddress, d.vaultAddress])
    ]

    return sumTokens2({ api, tokensAndOwners, permitFailure: true })
}

module.exports = {
    winr: {
        tvl
    },
};
