module.exports = {
    core: {
        tvl: async function tvl(api) {
            const totalStaked = await api.call({
                target: "0xF7B977d23Fc47736D767fB6AF0595102007a5433",
                abi: 'uint256:totalStaked',
            });
            api.addGasToken(totalStaked);
        }
    },
  
}
