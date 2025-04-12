const ADDRESSES = require('../helper/coreAssets.json')
const { masterchefExports, } = require("../helper/unknownTokens")

const token = ADDRESSES.harmony.MIS;
const masterchef = "0x59c777cd749b307be910f15c54a3116ff88f9706";

const sdk = require('@defillama/sdk');
async function goatTvl(api) {
  const {chain, block} = api;
  const {WBTC, DOGEB, BTCB} = ADDRESSES.goat;
  const tokens = ['0xeFEfeFEfeFeFEFEFEfefeFeFefEfEfEfeFEFEFEf', DOGEB, BTCB];
  const tokenContracts = await sdk.api.abi.multiCall({
    chain,
    block,
    abi: 'function getTokenContracts(address _token) view returns (tuple(address artToken, address depositPool, address withdrawalManager, address baseRewardPool))',
    calls: tokens.map(token => ({
      target: '0x479603DE0a8B6D2f4D4eaA1058Eea0d7Ac9E218d',
      params: token,
    })),
  });
  const totalDeposits = await sdk.api.abi.multiCall({
    chain,
    block,
    abi: 'function totalDeposited() view returns (uint256)',
    calls: tokenContracts.output.map(contracts => ({
      target: contracts.output.depositPool,
    }))
  });
  tokens.forEach((token, index) =>{
      api.add(
        index === 0 ? WBTC : token,
        totalDeposits.output[index].output,
      );
  });
}

module.exports = {
  ...masterchefExports({
    chain: 'harmony',
    useDefaultCoreAssets: true,
    masterchef,
    nativeToken: token,
    blacklistedTokens: [
      '0xed0b4b0f0e2c17646682fc98ace09feb99af3ade', // RVRS bad pricing
    ]
  }),
  goat: {
    tvl: goatTvl,
  }
}