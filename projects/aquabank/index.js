// projects/aquabank/index.js
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const USDt = ADDRESSES.avax.USDt  // 0x9702230A8Ea53601f5Cd2dc00fDBc13d4dF4A8c7

// Vaults that hold receipt tokens (not the underlying)
const BENQI_VAULT = '0x7D336B49879a173626E51BFF780686D88b8081ec'
const EULER_VAULT = '0x61E8f77eD693d3edeCBCc2dd9c55c1d987c47775'

// Protocol receipt tokens (convertible to USDt underlying)
const BENQI_RECEIPT = '0xd8fcDa6ec4Bdc547C0827B8804e89aCd817d56EF'
const EULER_RECEIPT = '0xa446938b0204Aa4055cdFEd68Ddf0E0d1BAB3E9E'

// Bank staking contracts where bUSDT is deposited
const bUSDT = '0x3C594084dC7AB1864AC69DFd01AB77E8f65B83B7'
const STAKERS = [
    '0x00F8a3B9395B4B02d12ee26536046c3C52459674', // Benqi BankStaking
    '0x743BcD612866fC7485BfC487B14Ebf9a67D753Cb', // Euler BankStaking
]

// ABIs
const erc20Bal = 'function balanceOf(address) view returns (uint256)'

const benqiAbi = {
    // Compound-style exchange rate (scaled by 1e18)
    exchangeRateStored: 'function exchangeRateStored() view returns (uint256)',
    underlying: 'function underlying() view returns (address)',
}

const eulerAbi = {
    // ERC4626-style conversion from shares to assets
    convertToAssets: 'function convertToAssets(uint256 shares) view returns (uint256)',
    asset: 'function asset() view returns (address)',
}

const toStr = (x) => (x?.toString?.() ?? String(x))
const toBN  = (x) => BigInt(toStr(x))

// TVL: sum USDt underlying represented by Benqi/Euler receipt tokens held in the vaults
async function tvl(api) {

    // 1) Read receipt balances held by the two vaults
    const [benqiShares, eulerShares] = await Promise.all([
        api.call({ target: BENQI_RECEIPT, abi: erc20Bal, params: BENQI_VAULT, permitFailure: true }),
        api.call({ target: EULER_RECEIPT, abi: erc20Bal, params: EULER_VAULT, permitFailure: true }),
    ])

    // 2) Convert Benqi shares -> USDt underlying using Compound-style exchange rate
    let benqiUnderlying = 0n
    if (benqiShares) {
        const rate = await api.call({ target: BENQI_RECEIPT, abi: benqiAbi.exchangeRateStored, permitFailure: true })
        if (rate) {
            // underlying = shares * rate / 1e18
            benqiUnderlying = (toBN(benqiShares) * toBN(rate)) / 10n**18n
        }
    }

    // 3) Convert Euler shares -> USDt underlying using ERC4626 conversion
    let eulerUnderlying = 0n
        if (eulerShares) {
            const out = await api.call({
                target: EULER_RECEIPT, abi: eulerAbi.convertToAssets, params: eulerShares, permitFailure: true
            })
        if (out) eulerUnderlying = toBN(out)
    }

    // 4) Add both underlyings as USDt
    if (benqiUnderlying > 0n) api.add(USDt, benqiUnderlying)
    if (eulerUnderlying > 0n) api.add(USDt, eulerUnderlying)

    return api.getBalances()
}

// Staking: sum bUSDT deposited in BankStaking contracts, mapped 1:1 to USDt
async function staking(api) {
    const tokensAndOwners = STAKERS.map(owner => [bUSDT, owner])
  
    // - bUSDT → USDt (Tether on Avalanche)
    return await sumTokens2({
        api,
        tokensAndOwners,
        transformAddress: (addr) => {
            const a = addr.toLowerCase()
            if (a === bUSDT.toLowerCase()) return `avax:${USDt.toLowerCase()}`
            return `avax:${a}`
        },
    })
}
  

module.exports = {
    methodology:
        ' TVL = USDt underlying represented by Benqi/Euler receipt tokens held in vaults (Benqi: shares*exchangeRate/1e18, Euler: convertToAssets). Staking = bUSDT deposited in BankStaking contracts, reported as USDt via 1:1 mapping.',
    avax: { 
        tvl,
        staking,
    },
}


