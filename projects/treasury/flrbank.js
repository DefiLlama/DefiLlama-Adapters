const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');
const { post } = require('../helper/http')
const { toAssetsUp } = require('../helper/morpoho')
const bank = '0x194726f6c2ae988f1ab5e1c943c17e591a6f6059'
const treasury = '0xaA68BC4BAb9a63958466f49f5a58c54A412D4906'
// same key as the treasury's C-chain address, bech32-encoded for the P-chain
const treasuryPChain = 'P-flare1y39epmwrfdtemgxpvkqephea38t80ccwswv30y'

const SPARKDEX_LP = '0x0F574Fc895c1abF82AefF334fA9d8bA43F866111' // BANK/WFLR SPARKDEX V2 LP
const ENOSYS_LP = '0x5F29C8d049e47DD180c2B83E3560E8e271110335' // BANK/WFLR ENOSYS V2 LP

const RFLR = '0x26d460c3Cf931Fb2014FA436a49e3Af08619810e' // reward FLR, claimable 1:1 for FLR
const MYSTIC_USDT0_VAULT = '0xE8dd6A1e13244A27bDaa19CcBf33013647C675d1' // Mystic Morpho vault (COREUSDT0)

const MORPHO = '0xF4346F5132e810f80a28487a79c7559d9797E8B0'
const MORPHO_MARKETS = [
  '0x2f31ab3fc12d6d10d1de9e5c74053126f03ac1f80a2e6d69d36a411fef7d942f', // FXRP collateral / USDT0 loan
  '0xcbe6d249967c061d6ecb586ec7efeedd66c4a4a7b45c5aa2156452234e0b6677', // wBANK collateral / WFLR loan
]
const WBANK = '0x9f1a66a34a8b2768dddeb49da99e6161d0d2dd87' // fee-free 1:1 wrapper of BANK

// Enosys governance stake managers, holding the staked token on the treasury's behalf
const ENOSYS_STAKES = [
  ['0x7eB8CeB0F64D934a31835b98eB4cbAb3cA56dF28', '0xfF56Eb5b1a7FAa972291117E5E9565dA29bc808d'], // APS
  ['0x988E94a0AEFB1fCdC0C4d44dDBa103C5d4c6c6b0', '0x140D8d3649Ec605CF69018C627fB44cCC76eC89f'], // HLN
]

// Enosys Loans (Liquity V2 fork) stability pools: [pool, branch collateral]
const STABILITY_POOLS = [
  ['0x2c817F7159c08d94f09764086330c96Bb3265A2f', ADDRESSES.flare.FXRP],
  ['0x0Dd6daab4cB9A0ba6707Cf59DBfbc28cc33CA24A', ADDRESSES.flare.WFLR],
  ['0x3FAEC256DCFDB9eBa882b5F71e020FA128081f56', '0x4C18Ff3C89632c3Dd62E796c0aFA5c07c4c1B2b3'], // stXRP
  ['0xE6B23B97A9058B88e6d068d57d8a69Fb07ab2A61', ADDRESSES.flare.sFLR],
]
const CDP = '0x6Cd3a5Ba46FA254D4d2E3C2B37350ae337E94a0F'

const morphoAbi = {
  idToMarketParams: 'function idToMarketParams(bytes32) view returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)',
  market: 'function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)',
  position: 'function position(bytes32, address) view returns (uint256 supplyShares, uint128 borrowShares, uint128 collateral)',
}

// collateral the treasury has posted, less what it owes; wBANK collateral is BANK, so it goes to ownTokens
async function morphoPositions(api, isOwnTokens) {
  const [params, markets, positions] = await Promise.all([
    api.multiCall({ target: MORPHO, abi: morphoAbi.idToMarketParams, calls: MORPHO_MARKETS }),
    api.multiCall({ target: MORPHO, abi: morphoAbi.market, calls: MORPHO_MARKETS }),
    api.multiCall({ target: MORPHO, abi: morphoAbi.position, calls: MORPHO_MARKETS.map((id) => ({ params: [id, treasury] })) }),
  ])
  positions.forEach((position, i) => {
    const isBank = params[i].collateralToken.toLowerCase() === WBANK
    if (isOwnTokens !== isBank) return
    api.add(isBank ? bank : params[i].collateralToken, position.collateral)
    const debt = toAssetsUp(position.borrowShares, markets[i].totalBorrowAssets, markets[i].totalBorrowShares)
    api.add(params[i].loanToken, -debt)
  })
}

async function pChainStake(api) {
  const call = (method) => post('https://flare-api.flare.network/ext/bc/P', { jsonrpc: '2.0', id: 1, method, params: { addresses: [treasuryPChain] } })
  const [stake, balance] = await Promise.all([call('platform.getStake'), call('platform.getBalance')])
  // P-chain amounts have 9 decimals
  const nanoFlr = BigInt(stake.result.staked) + BigInt(balance.result.unlocked)
  api.add(ADDRESSES.flare.WFLR, nanoFlr * 10n ** 9n)
}

module.exports = {
  flare: {
    tvl: async (api) => {
      await sumTokens2({
        owner: treasury,
        tokens: [
            ADDRESSES.flare.WFLR,
           SPARKDEX_LP, // SPARKDEX V2 LP (BANK/WFLR)
           ENOSYS_LP, // ENOSYS V2 LP (BANK/WFLR)
           ADDRESSES.flare.FXRP, // FXRP
           '0x4C18Ff3C89632c3Dd62E796c0aFA5c07c4c1B2b3', // stXRP
           ADDRESSES.flare.sFLR, // sFLR
           CDP, // CDP
           '0x1502FA4be69d526124D453619276FacCab275d3D', // WETH
          ],
        resolveLP: true,
        resolveUniV3: true,
        api,
      })

      const [rflr, vaultShares, stakes, deposits, yieldGains, collGains] = await Promise.all([
        api.call({ target: RFLR, abi: 'erc20:balanceOf', params: [treasury] }),
        api.call({ target: MYSTIC_USDT0_VAULT, abi: 'erc20:balanceOf', params: [treasury] }),
        api.multiCall({ abi: 'erc20:balanceOf', calls: ENOSYS_STAKES.map(([manager]) => ({ target: manager, params: [treasury] })) }),
        api.multiCall({ abi: 'function getCompoundedBoldDeposit(address) view returns (uint256)', calls: STABILITY_POOLS.map(([pool]) => ({ target: pool, params: [treasury] })) }),
        api.multiCall({ abi: 'function getDepositorYieldGain(address) view returns (uint256)', calls: STABILITY_POOLS.map(([pool]) => ({ target: pool, params: [treasury] })) }),
        api.multiCall({ abi: 'function getDepositorCollGain(address) view returns (uint256)', calls: STABILITY_POOLS.map(([pool]) => ({ target: pool, params: [treasury] })) }),
      ])
      api.add(ADDRESSES.flare.WFLR, rflr)
      const usdt0 = await api.call({ target: MYSTIC_USDT0_VAULT, abi: 'function convertToAssets(uint256) view returns (uint256)', params: [vaultShares] })
      api.add(ADDRESSES.flare.USDT0, usdt0)
      stakes.forEach((amount, i) => api.add(ENOSYS_STAKES[i][1], amount))
      STABILITY_POOLS.forEach(([, coll], i) => {
        api.add(CDP, deposits[i])
        api.add(CDP, yieldGains[i])
        api.add(coll, collGains[i])
      })

      await morphoPositions(api, false)
      await pChainStake(api)
      api.removeTokenBalance(bank)
    },
    ownTokens: async (api) => {
      await sumTokens2({ owner: treasury, tokens: [SPARKDEX_LP, ENOSYS_LP], resolveLP: true, api, })
      api.removeTokenBalance(ADDRESSES.flare.WFLR)
      await morphoPositions(api, true)
    }
  },
}
