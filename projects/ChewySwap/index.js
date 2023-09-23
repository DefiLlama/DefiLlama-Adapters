const { staking, getUniTVL } = require('../helper/unknownTokens')

const chain1 = 'shibarium'
const chain2 = 'dogechain'

const MasterChefContractShib = "0x4c00f75F179F4A8208BC2ba3958Eb8d1C7986418";
const CHEWY = "0x570C41a71b5e2cb8FF4445184d7ff6f78A4DbcBD";
const lps_shib = ['0x324EEf33AF720cE44DEAB7e32F4367a82b4eA43b']

const MasterChefContractDC = "0xdDC5b34c49E2Df3F78cA1B3D3BD9699a4e488c1D";
const DOGECORN = "0x8df9B21945ebaa75424730F85eCFf426C35F5EF8";
const lps_dc = ['0xD4f2E4107CC48296D25bc656bf9039fb3F406d79']

module.exports = {
    misrepresentedTokens: true,
    methodology: 'TVL accounts for the liquidity on all AMM pools. Staking on Shibarium accounts for the CHEWY locked in MasterChef (0x4c00f75F179F4A8208BC2ba3958Eb8d1C7986418) Staking on DC accounts for the DOGECORN locked in MasterChef (0xdDC5b34c49E2Df3F78cA1B3D3BD9699a4e488c1D)',
    shibarium: {
        tvl: getUniTVL({
          factory: '0xEDedDbde5ffA62545eDF97054edC11013ED72125',
          useDefaultCoreAssets: true,
        }),
        staking: staking({
            chain1,
            owners: [MasterChefContractShib],
            tokens: [CHEWY],
            useDefaultCoreAssets: true,
            lps_shib,
           })
    },
    dogechain: {
        tvl: getUniTVL({
          factory: '0x7C10a3b7EcD42dd7D79C0b9d58dDB812f92B574A',
          useDefaultCoreAssets: true,
        }),
        staking: staking({
            chain2,
            owners: [MasterChefContractDC],
            tokens: [DOGECORN],
            useDefaultCoreAssets: true,
            lps_dc,
           })
    },
};
