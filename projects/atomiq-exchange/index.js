const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens } = require("../helper/sumTokens");

const config = {
    bitcoin: {
        vault: "bc1pk3dr5ug0nndxen60u7dlvknt5y5kjc7axz8hqlpczw7cep6nm55q0vjtz6",
    },
    btnx: {
        vault: "0xe510D5781C6C849284Fb25Dc20b1684cEC445C8B",
    },
    starknet: {
        vault: "0x01932042992647771f3d0aa6ee526e65359c891fe05a285faaf4d3ffa373e132",
        tokens: [ADDRESSES.starknet.WBTC, ADDRESSES.starknet.STRK, ADDRESSES.starknet.ETH]
    },
    citrea: {
        vault: "0x5bb0C725939cB825d1322A99a3FeB570097628c3",
    },
}

async function tvl(api) {
    return await sumTokens({ owners: [config[api.chain].vault], api, tokens: config[api.chain].tokens ?? [ADDRESSES.null] });
}

module.exports = {
    timetravel: false,
    bitcoin: { tvl },
    btnx: { tvl },
    citrea: { tvl },
    starknet: { tvl },
    methodology: `TVL counts the total assets held in the Atomiq Exchange spv vaults on each chain.`,
}