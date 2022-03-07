const sdk = require("@defillama/sdk");
const abi = require("./abi.json")
const { pool2s } = require("../helper/pool2");
const { unwrapUniswapLPs } = require('../helper/unwrapLPs');

/*** Ethereum Addresses ***/
const comptroller = "0x959Fb43EF08F415da0AeA39BEEf92D96f41E41b3";

const farmContract = "0x9C3c5a058B83CBbE3Aa0a8a8711c2BD5080ccCa7";

const farmContractsBSC = [
    // Farm ID 41
    "0x92702dcCD53022831edd3FCBfEabbBA31BC29bB6",
    // Farm ID 17
    "0x172E45E4527484ea184F017898102D5e0E94Dc88",
    // Farm ID 42
    "0xb8A177d29417ee325953ec388BA2dBD77B02DdF4",
    // Farm ID 18
    "0x378319C0CdC4dCC09800154a47eF9ee7dAE044B8",
    // Farm ID 60
    "0xeED6E3F11bA173B82Bb913CaC943C0eF290A734a",
    // Farm ID 61
    "0x0ED995cB847185aC3cfDE9d1b8e8f57AB54a7247"
];

const pool2LpsBSC = [
    // OPEN-WETH UNI-V2 LP MAR
    "0x1dDf85Abdf165d2360B31D9603B487E0275e3928",
    // OPEN-USDT UNI-V2 LP DEC
    "0x507d84fe072Fe62A5F2e1F917Be8Cc58BdC53eF8",
    // OPEN-USDT UNI-V2 LP MAR
    "0x507d84fe072Fe62A5F2e1F917Be8Cc58BdC53eF8",
    // OPEN-WETH UNI-V2 LP DEC
    "0x1dDf85Abdf165d2360B31D9603B487E0275e3928",
    // OPEN-WETH UNI-V2 LP MAY
    "0x1dDf85Abdf165d2360B31D9603B487E0275e3928",
    // OPEN-USDT UNI-V2 LP MAY
    "0x507d84fe072Fe62A5F2e1F917Be8Cc58BdC53eF8"
];

const calc = async (balances, balance, comptroller, chain = "ethereum") => {
    let chainBlocks = {};

    const allMarkets = (
        await sdk.api.abi.call({
            abi: abi.getAllMarkets,
            target: comptroller,
            chain: chain,
            block: chainBlocks[chain]
        })
    ).output;

    const getBalance = (
        await sdk.api.abi.multiCall({
            abi: balance,
            calls: allMarkets.map(markets => ({
                target: markets,
            })),
            chain: chain,
            block: chainBlocks[chain]
        })
    ).output.map(bal => bal.output);

    const underlyings = (
        await sdk.api.abi.multiCall({
            abi: abi.underlying,
            calls: allMarkets.map(markets => ({
                target: markets,
            })),
            chain: chain,
            block: chainBlocks[chain]
        })
    ).output.map(under => under.output);

    const symbols = (
        await sdk.api.abi.multiCall({
            abi: abi.symbol,
            calls: underlyings.map(underlying => ({
                target: underlying,
            })),
            chain: chain,
            block: chainBlocks[chain]
        })
    ).output.map(symbol => symbol.output);

    const lpPositions = [];
    underlyings.forEach((underlying, idx) => {
        if (symbols[idx] == 'UNI-V2') {
            lpPositions.push({
                token: underlying,
                balance: getBalance[idx]
            })
        } else {
            sdk.util.sumSingleBalance(balances, `${chain}:${underlying}`, getBalance[idx]);
        }
    });

    await unwrapUniswapLPs(
        balances,
        lpPositions,
        chainBlocks[chain],
        chain,
        addr => `${chain}:${addr}`
    );
};

const ethTvl = async () => {
    const balances = {};

    await calc(balances, abi.getCash, comptroller);

    const poolLength = (
        await sdk.api.abi.call({
            abi: abi.poolLength,
            target: farmContract,
        })
    ).output;

    for (let i = 0; i < poolLength; i++) {
        const lpFarm = (
            await sdk.api.abi.call({
                abi: abi.poolInfo,
                target: farmContract,
                params: i
            })
        ).output.lpToken;

        const cashAddress = (
            await sdk.api.abi.call({
                abi: abi.cash,
                target: lpFarm,
            })
        ).output;

        const balance = (
            await sdk.api.erc20.balanceOf({
                target: cashAddress,
                owner: lpFarm
            })
        ).output;

        sdk.util.sumSingleBalance(balances, cashAddress, balance);
    }

    return balances;
};

const vaults = [
  "0x0a234ef34614a4eed1c1430a23b46f95df5f4257", // pOPEN
  "0xfff0cc78a7e7ce5d6ba60f23628ff9a63beee87f", // OCP
  "0x09139d7343953163eacde83845b342c1d08999ef", // LIME
  "0xd90ec012a6b2b549dd2a74024f1e025d0801696c", // LAND
  "0xcfefc606c4c010c242431f60a7afc13461df399c", // ROSEN
];

async function bscTvl(timestamp, block, chainBlocks) {
  let balances = {};
  let underlying = (
    await sdk.api.abi.multiCall({
      calls: vaults.map((p) => ({
        target: p,
      })),
      abi: abi.underlying,
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;
  let underlyingBalances = (
    await sdk.api.abi.multiCall({
      calls: underlying.map((p) => ({
        target: p.output,
        params: p.input.target,
      })),
      abi: "erc20:balanceOf",
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;
  underlyingBalances.forEach((p) => {
    sdk.util.sumSingleBalance(balances, `bsc:${p.input.target}`, p.output);
  });
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
      pool2: pool2s(farmContractsBSC, pool2LpsBSC),
      tvl: ethTvl
  },
  bsc: {
      tvl: bscTvl,
  },
  methodology:
      "We count liquidity on the Markets same as compound, and we export Borrowing part too",
}