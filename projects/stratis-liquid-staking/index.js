const STAKING_CONTRACT = '0x9490e998E3f1f65064a41a11cd66F2aA54aF68D7';
const abi = require("./abi.json");

module.exports = {
    methodology: "Tvl data that staked on Stratis liquid staking protocol by community .",
    stratis: {
        tvl: async (api) => {
            const { _totalEth } = (await api.call({ target: STAKING_CONTRACT, abi: abi }))
            return { 'stratis': _totalEth / 1e18 }
        }
    }
}
