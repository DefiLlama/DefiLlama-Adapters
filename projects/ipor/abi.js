module.exports = {
    abi: {
        getAccruedBalance: {
            inputs: [],
            name: "getAccruedBalance",
            outputs: [
                {internalType: "uint256", name: "totalCollateralPayFixed", type: "uint256"},
                {internalType: "uint256", name: "totalCollateralReceiveFixed", type: "uint256"},
                {internalType: "uint256", name: "liquidityPool", type: "uint256"},
                {internalType: "uint256", name: "vault", type: "uint256"},
            ],
            payable: false,
            stateMutability: "view",
            type: "function",
        },
        getAsset: {"inputs":[],"name":"getAsset","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}
    },
};
