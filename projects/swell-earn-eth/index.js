const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const earnETHVault = '0x9Ed15383940CC380fAEF0a75edacE507cC775f22';

const tokens = [
    '0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0', // rswETH
    '0xf951E335afb289353dc249e82926178EaC7DEd78', // swETH
    ADDRESSES.ethereum.WSTETH, // wstETH
    ADDRESSES.ethereum.WETH, // WETH
]

const tvl = async (api) => {
    return sumTokens2({ api, tokens, owner: earnETHVault })
}

module.exports = {
    methodology: 'TVL represents the sum of tokens deposited in the vault',
    doublecounted: true,
    ethereum : { tvl }
}