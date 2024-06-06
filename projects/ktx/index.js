const { staking } = require("../helper/staking");
const { gmxExports } = require("../helper/gmx");

const bscVault = "0xd98b46C6c4D3DBc6a9Cc965F385BDDDf7a660856";
const bscStaking = "0x5d1459517ab9FfD60f8aDECdD497ac94DD62d3FD";
const bscKTC = "0x545356d4d69d8cD1213Ee7e339867574738751CA";

const mantleVault = "0x2e488D7ED78171793FA91fAd5352Be423A50Dae1";
const mantleStaking = "0x1D29411f42bEd70d1567B4B6B4638Ee46Bae7146";
const mantleKTC = "0x779f4E5fB773E17Bc8E809F4ef1aBb140861159a";

const arbitrumVault = "0xc657A1440d266dD21ec3c299A8B9098065f663Bb";
const arbitrumStaking = "0xC7011480CEa31218cb18b9ADbEF7d78Fc684C935";
const arbitrumKTC = "0x487f6baB6DEC7815dcd7Dfa2C44a8a17bd3dEd27";

module.exports = {
  bsc: {
    staking: staking(bscStaking, bscKTC),
    tvl: gmxExports({ vault: bscVault }),
  },
  mantle: {
    staking: staking(mantleStaking, mantleKTC),
    tvl: gmxExports({ vault: mantleVault }),
  },
  arbitrum: {
    staking: staking(arbitrumStaking, arbitrumKTC),
    tvl: gmxExports({ vault: arbitrumVault }),
  },
};
