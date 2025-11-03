const AAVE_TOKEN_ADDRESS = '0x5D72a9d9A9510Cd8cBdBA12aC62593A58930a948';

const FLUID_POOLS = {
    'USDT0': '0x1DD4b13fcAE900C60a350589BE8052959D2Ed27B',
};
const PLASMA_EULER_POOLS = {
    'K3 Capital USDT0 Vault': '0xe818ad0D20D504C55601b9d5e0E137314414dec4',
    'Re7 USDT0 Core': '0xa5EeD1615cd883dD6883ca3a385F525e3bEB4E79',
    'Hyperithm Euler USDT': '0x66bE42a0BdA425A8C3b3c2cF4F4Cb9EDfcAEd21d',
};

const allPoolTokens = [
    AAVE_TOKEN_ADDRESS,
    ...Object.values(FLUID_POOLS),
    ...Object.values(PLASMA_EULER_POOLS),
]

module.exports = {
    allPoolTokens
}