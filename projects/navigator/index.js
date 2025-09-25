const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");
const { gmxExports } = require("../helper/gmx");
const { sumTokens2 } = require("../helper/unwrapLPs");
const {getLogs2} = require("../helper/cache/getLogs");

// sonic
const sonicVault = "0xe9263682E837eFabb145f8C632B9d2c518D90652";
const sonicStaking = "0xEF8770E9506a8D1aAE3D599327a39Cf14B6B3dc4";
const sonicNAVI = "0x6881B80ea7C858E4aEEf63893e18a8A36f3682f3";

// sonicV2
const sonicV2Vault = "0x41cD8CaFc24A771031B9eB9C57cFC94D86045eB6";
const sonicV2SettingManager = "0x7b9e962dd8AeD0Db9A1D8a2D7A962ad8b871Ce4F";

const tvl = async (api) => {
    const logs = await getLogs2({
        api,
        target: sonicV2SettingManager,
        eventAbi: 'event SetEnableStaking(address indexed token, bool isEnabled)',
        fromBlock: 655713,
    })
    const sonicV2Assets = logs.map(i => i.token)
    await Promise.all([
        gmxExports({ vault: sonicVault })(api),
        sumTokens2({ api, tokens: sonicV2Assets, owner: sonicV2Vault })])
};

module.exports = {
    sonic: {
        tvl,
        staking: staking(sonicStaking, sonicNAVI)
    }
}
