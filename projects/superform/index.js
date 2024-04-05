const modulesToExport = {};
const superform_chains = ["ethereum", "polygon", "bsc", "avax", "arbitrum", "optimism", "base"];
const factory_contract = "0xD85ec15A9F814D6173bF1a89273bFB3964aAdaEC";

const calcTvl = async (api) => {
    const vaultCount = await api.call({
        abi: "function getSuperformCount() external view returns(uint256)",
        target: factory_contract,
    });

    let balances = [];
    let tokens = [];

    for (let i = 0; i < vaultCount; i++) {
            const vault = await api.call({
                abi: "function superforms(uint256) external view returns(uint256)",
                target: factory_contract,
                params: [i],
            });

            const getSuperformRes = await api.call({
                abi: "function getSuperform(uint256) external view returns(address, uint32, uint64)",
                target: factory_contract,
                params: [vault],
            });

            const [vaultAddress, assetAddress] = await Promise.all([
                api.call({
                    abi: "function vault() external view returns(address)",
                    target: getSuperformRes[0],
                }),
                api.call({
                    abi: "function asset() external view returns(address)",
                    target: getSuperformRes[0],
                })
            ])

            const balanceOfShares = await api.call({
                abi: "erc20:balanceOf",
                target: vaultAddress,
                params: [getSuperformRes[0]],
            });
        
        try{
            const balanceOfCollateral = await api.call({
                abi: "function previewRedeemFrom(uint256) external view returns(uint256)",
                target: getSuperformRes[0],
                params: [balanceOfShares],
            });

            balances.push(balanceOfCollateral);
            tokens.push(assetAddress);
        } catch (err) {
            console.log("previewRedeem reverts");
        }
    }

    return api.addTokens(tokens, balances);
};

superform_chains.forEach((chain) => {
    modulesToExport[chain] = {
        tvl: calcTvl
    }
})

module.exports = {
    timetravel: true,
    methodology: "counts the TVL of each superform across all the supported networks",
    ...modulesToExport
};