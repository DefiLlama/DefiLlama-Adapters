const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");
const { getProvider, sumTokens2, } = require("../helper/solana");
const { Program } = require("@project-serum/anchor");
const idl = require('./idl.json')


const BRIDGE_DEPOSITOR_EVM = '0xaEA5Bf79F1E3F2069a99A99928927988EC642e0B';
const BRIDGE_DEPOSITOR_SOL = 'HYDqq5GfUj4aBuPpSCs4fkmeS7jZHRhrrQ3q72KsJdD4';

const SOL_VAULTS = ['4nsvUvEGo4AbUYTgT46RhPCV81KbxGnzHfxnHaNZantA', 'DurSN134DtPxv9DT2EdDemLftwqLuFPKCu98NEfna63W', 'Ey1gR9BnFpVCD6UwWit9KbEQz5qXJbP75BmYCoxcfqD8', 'F82gzrGRNM5am9Eo1umL5vh4m7mMHaGeUhu8ymZPvaWk', 'HS8YCGvg4d3bgqbNV2PGXjyAKLiDmZ2GJKWyKJFSoLHH']

async function sol_tvl() {
    const provider = getProvider()
    const program = new Program(idl, BRIDGE_DEPOSITOR_SOL, provider)
    let tokenAccounts = (await Promise.all(SOL_VAULTS.map((v) => program.account.vaultData.fetch(v)))).map((a) => a.vaultAta);
    return sumTokens2({ tokenAccounts})
}


module.exports = {
    ethereum: {
      tvl: sumTokensExport({
        owner: BRIDGE_DEPOSITOR_EVM,
        tokens: [
          ADDRESSES.null, // ETH
          ADDRESSES.ethereum.WBTC, // WBTC
          ADDRESSES.ethereum.WETH, // WETH
          "0xd31a59c85ae9d8edefec411d448f90841571b89c", // WSOL
          ADDRESSES.ethereum.WSTETH, // Lido WSTETH
          ADDRESSES.ethereum.EETH, // EETH
          '0xd9a442856c234a39a81a089c06451ebaa4306a72', // pufETH
          '0xf951e335afb289353dc249e82926178eac7ded78', // swETH
          ADDRESSES.ethereum.USDT, // USDT
          ADDRESSES.ethereum.USDC, // USDC
          ADDRESSES.ethereum.DAI, // DAI
          '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110', // ezETH
          ADDRESSES.ethereum.USDe, // Ethena USD
        ],
    }),
    },
    bsc: {
        tvl: sumTokensExport({
          owner: BRIDGE_DEPOSITOR_EVM,
          tokens: [
            ADDRESSES.null, // BNB
            ADDRESSES.bsc.USDC, // USDC
            ADDRESSES.bsc.USDT, // USDT
            '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3', // DAI
          ],
        }),
      },
    arbitrum: {
        tvl: sumTokensExport({
          owner: BRIDGE_DEPOSITOR_EVM,
          tokens: [
            ADDRESSES.null, // ETH
            ADDRESSES.arbitrum.USDC_CIRCLE, // USDC
            ADDRESSES.arbitrum.USDT, // USDT
            ADDRESSES.arbitrum.DAI, // DAI
            ADDRESSES.optimism.ezETH, // ezETH
          ],
        }),
      },
    base: {
        tvl: sumTokensExport({
          owner: BRIDGE_DEPOSITOR_EVM,
          tokens: [
            ADDRESSES.null, // ETH
            ADDRESSES.base.USDC, // USDC
          ],
        }),
      },
    polygon: {
        tvl: sumTokensExport({
          owner: BRIDGE_DEPOSITOR_EVM,
          tokens: [
            ADDRESSES.null, // POL
            ADDRESSES.polygon.USDC, // USDC
            ADDRESSES.polygon.USDT, // USDT
            ADDRESSES.polygon.DAI, // DAI
          ],
        }),
      },
    avax: {
        tvl: sumTokensExport({
          owner: BRIDGE_DEPOSITOR_EVM,
          tokens: [
            ADDRESSES.null, // AVA
            ADDRESSES.avax.USDC, // USDC
            ADDRESSES.avax.USDt, // USDT
            ADDRESSES.avax.DAI, // DAI
          ],
        }),
    },
    optimism: {
        tvl: sumTokensExport({
          owner: BRIDGE_DEPOSITOR_EVM,
          tokens: [
            ADDRESSES.null, // ETH
            ADDRESSES.optimism.USDC_CIRCLE, // USDC
            ADDRESSES.optimism.USDT, // USDT
            ADDRESSES.optimism.DAI, // DAI
          ],
        }),
    },
    blast: {
        tvl: sumTokensExport({
          owner: BRIDGE_DEPOSITOR_EVM,
          tokens: [
            ADDRESSES.null, // ETH
            ADDRESSES.blast.USDB, // USDB
          ],
        }),
    },
    solana: {
        tvl: sol_tvl
    }
}