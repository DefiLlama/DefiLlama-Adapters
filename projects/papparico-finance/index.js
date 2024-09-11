const { sumTokensExport } = require("../helper/unwrapLPs");

const PPFT_TOKEN = "0x59BAfb7168972EcCA5e395F7dA88e71eCe47a260";
const PPFT_LP = "0xb036145476Ad16782eC05C7EC340D7e3cE6D09b7";

const XPPFT_TOKEN = "0x961105dD9bE34B64A27251d72B6D8F086847bc1c";
const XPPFT_LP = "0xA99F134FC1e922Bc78Aa78c5897ce1eeF925b179";

const STAKING_CONTRACT = "0x535503d5c23bCA9896383003A46A8AD6c9CB2fe2";
const SINGLE_STAKING_CONTRACT = "0xFc8d5d6B280BF5E8d8DB12d0fF8a0f7d1A6ECf78";
const VAULTS_CONTRACT = "0x828CC5D75594e4d0D072566cC07F64E863A0d11E";
const LP_MINING_CONTRACT = "0x3E35810A663c7eE28a0A6f6A0984146CbB163c6c";
const LP_MINING_CONTRACT_V2 = "0x2490AFBf1609119bB76E5e936f4ce4cBed815947";

async function addPpftTvl(api) {
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: [
    { target: PPFT_TOKEN, params: STAKING_CONTRACT },
    { target: PPFT_TOKEN, params: SINGLE_STAKING_CONTRACT },
    { target: PPFT_TOKEN, params: VAULTS_CONTRACT },
  ]});

  api.addTokens(PPFT_TOKEN, balances);
}

async function addXppftTvl(api) {
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: [
    { target: XPPFT_TOKEN, params: STAKING_CONTRACT },
  ]});

  api.addTokens(XPPFT_TOKEN, balances);
}

async function cronosTvl(api) {
  await addPpftTvl(api);
  await addXppftTvl(api);
}

module.exports = {
  start: 13406569,
  cronos: {
    tvl: cronosTvl,
    staking: sumTokensExport({
      tokensAndOwners: [
        [PPFT_TOKEN, STAKING_CONTRACT], 
        [PPFT_TOKEN, SINGLE_STAKING_CONTRACT], 
        [PPFT_TOKEN, VAULTS_CONTRACT],
        [XPPFT_TOKEN, SINGLE_STAKING_CONTRACT]
      ],
    }),
    pool2: sumTokensExport({
      tokensAndOwners: [
        [PPFT_LP, LP_MINING_CONTRACT], [PPFT_LP, LP_MINING_CONTRACT_V2],
        [XPPFT_LP, LP_MINING_CONTRACT], [XPPFT_LP, LP_MINING_CONTRACT_V2],
      ],
      resolveLP: true,
    }),
  }
};