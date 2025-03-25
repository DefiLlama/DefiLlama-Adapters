const sdk = require('@defillama/sdk')

const { vaultAdapterAbi } = require('./abis')
const { sumTokens2 } = require("../helper/unwrapLPs");

const WWINR_ADDRESS = "0xbf6fa9d2bf9f681e7b6521b49cf8eccf9ad8d31d";
const WINR_LOCKV2_CONTRACT = "0x7f3E35B41BDF7DBA6a90661918d0EfDDC6C15c3C";
const WINR_VAULT_ADAPTER_CONTRACT = "0xc942b79E51fe075c9D8d2c7501A596b4430b9Dd7";

const JUSTBET_BANKROLL_INDEXES = [
    '0x0000000000000000000000000000000000000001',
    '0x0000000000000000000000000000000000000006',
    '0x0000000000000000000000000000000000000013',
    '0x0000000000000000000000000000000000000014',
    '0x0000000000000000000000000000000000000015',
    '0x0000000000000000000000000000000000000019'
];

const tvl = async (api) => {
    const [poolsDetails, lockBalance] = await Promise.all([
        api.call({
            abi: vaultAdapterAbi,
            target: WINR_VAULT_ADAPTER_CONTRACT,
            params: [JUSTBET_BANKROLL_INDEXES]
        }),
        sdk.api.eth.getBalance({ target: WINR_LOCKV2_CONTRACT, chain: 'winr'}),
    ])


    const [details, amounts] = [poolsDetails[0], poolsDetails[1]];
    const pools = [];

    details.forEach((detail, index) => {
        pools.push({
            detail: detail,
            amount: amounts[index]
        });
    });

    const tokens = pools.map(p => p.detail)
    const bals = await api.multiCall({  abi: 'erc20:balanceOf', calls: tokens.map(i => ({ target: i.bankrollTokenAddress, params: i.vaultAddress})) })
    
    
    const tokenAddresses = tokens.map(i => i.bankrollTokenAddress.toLowerCase())
    const winrIndex = tokenAddresses.findIndex(i => i === WWINR_ADDRESS.toLowerCase())
        
    bals[winrIndex] = BigInt(bals[winrIndex]) + BigInt(lockBalance.output)

    api.addTokens(tokenAddresses, bals)

    return sumTokens2({ api })
}

module.exports = {
    winr: {
        tvl
    },
};
