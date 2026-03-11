const { sumTokensExport } = require('../helper/unwrapLPs');

const ernToken = '0xBBc2AE13b23d715c30720F079fcd9B4a74093505';
const stonesFarm = '0xEdFE9aC42a511e1C523E067DB8345711419d4f14';
const ernLPFarm = '0x34a77Aa9AE42ff9a9B2078E450651D112D5BE908';
const ernLP = '0x570febdf89c07f256c75686caca215289bb11cfc';

module.exports = {
    ethereum:{
        tvl: sumTokensExport({ tokensAndOwners: [[ernToken, stonesFarm], [ernLP, ernLPFarm]], resolveLP: true }),
    },
}
