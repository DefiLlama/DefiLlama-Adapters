const { staking } = require('../helper/staking')

module.exports = {
  methodology: 'TVL counts staked DEXI coins on the platform itself. CoinGecko is used to find the price of tokens in USD.',
  polygon: {
    tvl:() => 0,
    staking: staking(["0x6e17539F792A31F39cEEc0BcaB4079032523e3c7","0x233a2901EB51380E7Bf30fA3D31d4c326471B489","0x0C693035837C52Da8c2A4505bdf0f2aC43f9909C","0xA17c08d8FC00481A937ecE7FDF5C94082bdFFE17"], '0x65ba64899c2c7dbfdb5130e42e2cc56de281c78b')
  },
  kava: {
    tvl:() => 0,
    staking: staking(["0xB8e29c001E41Bc3A3dF7E1A549bdd898640189F5","0x732Bb01c38b7092eB554A7779ad5F7BCd3430266","0x5a4C7C9d3126C57CDDc7856dfA085e5B775ce212","0x6FA2d43f7D766Fd9b2990426a06Bb24B4FBcE959"], '0xd22a58f79e9481d1a88e00c343885a588b34b68b')
  },
};
