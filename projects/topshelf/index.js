const {getLiquityTvl} = require('../helper/liquity')

module.exports = {
  timetravel: true,
  methodology: "Deposited AVAX, BNB and FTM on all three chains as well as deposits in staking pools.",
  bsc:{
    tvl: getLiquityTvl("0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", "0xD295F4b58D159167DB247de06673169425B50EF2",
      "0xF40D2991d41ce989c4DCc0C475D4cEFbA7776866", "0x15102B7579aE3b913B0cbb2edE791fC58C528195", "bsc", true)
  },
  avalanche:{
    tvl: getLiquityTvl("0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", "0x40b393cecf8F7D7Fc79b83e8fA40e850511817f6",
      "0x0d37E5FF77cd482748cdD5251c92a65377D59000", "0x41c36D163DB9e58608F4B354FfB3893EF472E9fd", "avax", true)
  },
  fantom:{
    tvl: getLiquityTvl("0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83", "0x4A89338A2079A01eDBF5027330EAC10B615024E5",
      "0xc0e133D2bb669df10eC147C31694eF88Ef0dB8Ec", "0x5420d619823b7d836341524C55f3c24B4D497c72", "fantom", true)
  }
};
