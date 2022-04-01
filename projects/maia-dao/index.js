const sdk = require("@defillama/sdk");
const { transformMetisAddress } = require('../helper/portedTokens');
const { unwrapUniswapLPs } = require('../helper/unwrapLPs');
const abis = require("./abis.json");
const { staking } = require("../helper/staking");

const MaiaStaking = "0xE2546b144eFc3F8bd85d84b6CA64cC4F033c9be1"
const maia = "0x72c232D56542Ba082592DEE7C77b1C6CFA758BCD"

const HERMES = '0xb27BbeaACA2C00d6258C3118BAB6b5B6975161c8';
const multisig = '0x77314eAA8D99C2Ad55f3ca6dF4300CFC50BdBC7F';
const excludedTokens = [];

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};
    const transform = await transformMetisAddress();
    
    const hermesBalance = (await sdk.api.abi.multiCall({
      target: '0xa4C546c8F3ca15aa537D2ac3f62EE808d915B65b',
      calls: Array.from({ length: Number(40) }, (_, k) => ({
          params: [k],
      })),
      abi: abis.locked,
      block: chainBlocks.metis,
      chain: 'metis'
    })).output;

    var sum = 0;
    for (let i = 1; i < 40; i++) {
      sum += Number(hermesBalance[i].output.amount);
    }

    balances[`metis:${HERMES}`] = BigInt(sum).toString()

    const noPairs = (await sdk.api.abi.call({
        target: '0x879828da3a678D349A3C8d6B3D9C78e9Ee31137F',
        abi: abis.length,
        block: chainBlocks.metis,
        chain: 'metis'
    })).output;

    const pairAddresses = (await sdk.api.abi.multiCall({
        target: '0x879828da3a678D349A3C8d6B3D9C78e9Ee31137F',
        calls: Array.from({ length: Number(noPairs) }, (_, k) => ({
            params: k,
        })),
        abi: abis.pools,
        block: chainBlocks.metis,
        chain: 'metis'
    })).output;

    let gauges = (await sdk.api.abi.multiCall({
        target: '0x879828da3a678D349A3C8d6B3D9C78e9Ee31137F',
        calls: pairAddresses.map(a => ({
            params: a.output
        })),
        abi: abis.gauges,
        block: chainBlocks.metis,
        chain: 'metis'
    })).output;

    let pairBalances = []

    for (let i = 0; i < Number(noPairs); i++) {
      pairBalances.push(
        await sdk.api.abi.call({
          target: gauges[i].output,
          abi: abis.balanceOf,
          params: [multisig],
          block: chainBlocks.metis,
          chain: "metis",
        })
      );      
    }

    let lpPositions = [];
    for (let i = 0; i < pairBalances.length; i++) {
        if (
            pairAddresses[i].output &&
            excludedTokens.includes(pairAddresses[i].output.toLowerCase())
        ) {
            continue;
        };
        lpPositions.push({
            balance: pairBalances[i].output,
            token: pairAddresses[i].output
        });
    };

    await unwrapUniswapLPs(
        balances,
        lpPositions,
        chainBlocks.metis,
        'metis',
        transform
    );

    return balances;
};

module.exports = {
  metis: {
    tvl,
    staking: staking(MaiaStaking, maia, "metis")
  }
};
