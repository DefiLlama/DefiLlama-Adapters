const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const {ethers} = require("ethers");

const ethAddress = ADDRESSES.null;

async function tvl(_, _1, _2, { api }) {
    
    let balances = {};

    const abi = "function totalAssets() view returns (uint256)"

    const kETHStrategyAddress = "0xa060a5F83Db8bf08b45Cf56Db370c9383b7B895C";
    const dETHVaultAddress = "0x4c7aF9BdDac5bD3bee9cd2Aa2FeEeeE7610f5a6B";

    let kETHTvl = ethers.BigNumber.from(await api.call({abi: abi, target: kETHStrategyAddress}));
    let dETHTvl = ethers.BigNumber.from(await api.call({abi: abi, target: dETHVaultAddress}));

    const totalTvl = kETHTvl.add(dETHTvl)

    await sdk.util.sumSingleBalance(balances, ethAddress, totalTvl, api.chain)
    
    return balances;
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl
  }
};