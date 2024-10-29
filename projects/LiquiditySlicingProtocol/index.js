const abi = require("./abi.json");
const { ethers } = require('ethers');
const BigNumber = require("bignumber.js");

const MANAGER_CONTRACT_ADDRESS = "0x1F0ea3b63F3Fca05719E54E7469Ef897754eF666";

const transformToken = {
    manta: "manta-network",
    aleo: "ALEO"
}

const config = {
    manta: {
        chainId: 2,
        decimals: 18,
        delegator: {
            "0x89060B31DB21C6cB4e946EaCB28EFefF085C275a": ["0x2847e7f2823a5048f4ae2cd808a5e978aa6ce41fcbb6e7e7bbbb1b64446b0639"]
        },
        validator: {
            "0xaB21907461313127Ce944F6f168888d93C091363": ["0x8e8103383262ff2256490767e2338ffc452bf602b0addede203da3218cc9d241"]
        }
    },
    aleo: {
        chainId: 5,
        decimals: 6,
        delegator: {
            "0x52ade9c48599d71603cf661f98c9b7bd21cfb8ba448efd6204e89096b969c30c": ["0xbb57045a8a9c39dfb06baaf5ed6cb02343a17feecbf63aba9b15a6694476140f"]
        },
        validator: {
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff": ["0x0000000000000000000000000000000000000000000000000000000000000005"]
        }
    }
};

async function getTotalStaked(api, chainId, hostAddr, nodeAddr) {
    const i = await api.call({ abi: abi.checkContract, target: MANAGER_CONTRACT_ADDRESS, params: [chainId, ethers.zeroPadValue(hostAddr, 32)] });
    const [totalStaked] = await api.call({ abi: abi.nodeStates, target: MANAGER_CONTRACT_ADDRESS, params: [i, nodeAddr] });
    return new BigNumber(totalStaked);
}

async function tvl(api) {
    let ret = {};

    for (const chain of Object.keys(config)) {
        const tokenId = transformToken[chain];
        ret[tokenId] = new BigNumber(0);

        const id = config[chain].chainId;
        for (const [delegator, nodes] of Object.entries(config[chain].delegator)) {
            const allStaked = await Promise.all(nodes.map((node) => getTotalStaked(api, id, delegator, node)));
            ret[tokenId] = ret[tokenId].plus(
                allStaked.reduce(
                    (a, b) => a.plus(b.div(10 ** config[chain].decimals).toFixed(4)), new BigNumber(0)
                )
            );
        }

        for (const [validator, nodes] of Object.entries(config[chain].validator)) {
            const allStaked = await Promise.all(nodes.map((node) => getTotalStaked(api, id, validator, node)));
            ret[tokenId] = ret[tokenId].plus(
                allStaked.reduce(
                    (a, b) => a.plus(b.div(10 ** config[chain].decimals).toFixed(4)), new BigNumber(0)
                )
            );
        }
    }

    return ret;
}

module.exports = {
    arbitrum: {
        start: 224198345,
        tvl,
    }
}
