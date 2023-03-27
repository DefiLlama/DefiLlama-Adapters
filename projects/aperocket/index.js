const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

/* Certain portion of TVL accounted by their site is coming from their own native token
 * in differente blockchains (i.e, bsc and polygon). Aprox $6.0M
 */

const V2_READER = "0xDc84cbf85ADA13ACAe796FAa4472C19cC901b042"
const MERCURY_READER = "0xc9e54c7ec73aEe86e2BB07c4c6B65BE8BD86Ca90"

const V2_VAULTS_CONTRACTS_BSC = [
  "0xa13eF34F11cD905A1aACe891e3Fd1b355D770e7F", // BANANA
  "0x41b726444CcD5137A7Ec1Fbb870b9eFF57F89E89", // CAKE
  "0xA298f622E8B46491749C1ccDBe2DfFA13049A930", // BSW
  "0xa126C7f00875343f233e3c2f95067c80ab5B068a", // BANANA-BNB LP (ApeSwap)
  "0xD259A715De1fB30AD76Cc9580e68A15Ee9D12Dc2", // BANANA-BNB LP Maximizer (ApeSwap)
  "0x313adEc67e70a86Bd1166CCAcB8aCA932f28E95B", // CAKE-BNB LP (PancakeSwap)
  "0xaC3184b1F2888caaB5A7dE1381707c15c153B04A", // CAKE-BNB LP Maximizer (PancakeSwap)
  "0xB8469e8A7a8893E4c698B3De8163906386861B96", // BSW-BNB LP (Biswap)
  "0x76a3fE4350F13042EC179E5240bC68349d2AAD35", // BSW-BNB LP Maximizer (Biswap)
  "0x1c86DB4820Acb4Dd91A80a8874afb82251aeb937", // BANANA-BUSD LP (ApeSwap)
  "0xf3D78aE6A67D391fd894ee8f4da7842EC07CF446", // BANANA-BUSD LP Maximizer (ApeSwap)
  "0x34d1f4FA762c85f363cb5907Ca0BAcF53aBac866", // BSW-USDT LP (Biswap)
  "0xcf02e68b900Ce87F8715CAEF8b8a9e212b9158A1", // BUSD-BNB LP (PancakeSwap)
  "0x7dBB2b2Fd312710C805D4c78EE55ca1F8750Bace", // BUSD-BNB LP (ApeSwap)
  "0xa8A2c0aa4C050D2cB5C1Ac224A31c76492A35B80", // BNB-BUSD LP (Biswap)
  "0x101bCD396DDFb934072a171Bc4F625B85D505C78", // BUSD-BNB LP Maximizer (ApeSwap)
  "0xBC84830C42cedc1A32b665BfEaB3Fb16bcdFb8e3", // BNB-BUSD LP Maximizer (Biswap)
  "0xd9137C7be7a3117941317d525B06c441eAC7380d", // ETH-BNB LP Maximizer (ApeSwap)
  "0xe1F45D11B5D0Ddbe300cADFeFd7021Ac750a4281", // BUSD-USDC LP (ApeSwap)
  "0x1119FBECe0F576D318ce489886d05A098e94961F", // BUSD-USDC LP Maximizer (ApeSwap)
  "0x0Edf919fe5cDA4c7fA02AE7de77243cecedFd036", // ADA-BNB LP (ApeSwap)
  "0x8ADDf5FcE06B9F93cBf1F8B2ef580b25D1EDBE56", // ADA-BNB LP Maximizer (ApeSwap)
  "0x8747431ddFf6069f32ad8eE0Da51084432F8594C", // BUSD-USDT LP (ApeSwap)
  "0xC8bba6AC77804b3b6b28D6C5890b98fb935F361F", // BUSD-USDT LP Maximizer (ApeSwap)
  "0x8E1fcB9b48A299b71d7a4CDc24F11439cF253126", // BNB-USDT LP (Biswap)
  "0x681969eBfC476E8208CA551fA364e8FE6a19242F", // ETH-BTCB LP (Biswap)
  "0x1AFB491895D301a7cea026a5c65316b2C05A56B4", // ETH-BTCB LP Maximizer (Biswap)
];

const MERCURY_SINGLE_VAULTS_CONTRACTS_BSC = [
  {
    address: "0xFfDcD49d902d71445B93DCbFa51E2F9797de05C9", // BANANA
    isLp: false,
    router: "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7",
  },
];

const bscTvl = async (timestamp, block, chainBlocks) => {
  block = chainBlocks.bsc
  const getV2Tvls = (
    await sdk.api.abi.multiCall({
      abi: abi.tvlOfPool,
      calls: V2_VAULTS_CONTRACTS_BSC.map((vcb) => ({
        target: V2_READER,
        params: [vcb],
      })),
      block,
      chain: "bsc",
    })
  ).output.map((tvl) => tvl.output);

  const v2Tvl = getV2Tvls.reduce((previousValue, currentValue) => Number(previousValue) + Number(currentValue))

  const getMercuryTvls = (
    await sdk.api.abi.multiCall({
      abi: abi.tvlOfVault,
      calls: MERCURY_SINGLE_VAULTS_CONTRACTS_BSC.map((vcb) => ({
        target: MERCURY_READER,
        params: [vcb.address, vcb.isLp, vcb.router],
      })),
      block,
      chain: "bsc",
    })
  ).output.map((tvl) => tvl.output);

  const mercuryTvl = getMercuryTvls.reduce((previousValue, currentValue) => Number(previousValue) + Number(currentValue))

  const totalTvl = (v2Tvl / 10 ** 18) + (mercuryTvl / 10 ** 18)

  return {
    'tether': totalTvl,
  };
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },  
  methodology: `TVL consists of deposits made to the Earn Vaults of ApeRocket minus the 'SPACE' vault and the 'SPACE-BNB' pool2 vault which are created using the protocol's native token.`,
  misrepresentedTokens: true,
};
