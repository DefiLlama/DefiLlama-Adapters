const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xf3fc178157fb3c87548baa86f9d24ba38e649b58";
const l1_surplus_fees = "0x2E041280627800801E90E9Ac83532fadb6cAd99A"
const l2_surplus_fees = "0x32e7AF5A8151934F3787d0cD59EB6EDd0a736b1d"
const l2_base_fees = "0xbF5041Fc07E1c866D15c749156657B8eEd0fb649"
const l2_treasury_timelock = "0xbFc1FECa8B09A5c5D3EFfE7429eBE24b9c09EF58"

const ARB = ADDRESSES.arbitrum.ARB;

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury, l1_surplus_fees, l2_surplus_fees, l2_base_fees, l2_treasury_timelock],
    ownTokens: [ARB],
  },
  arbitrum_nova: {
    tokens: [ 
        nullAddress,
     ],
    owners: ["0x509386DbF5C0BE6fd68Df97A05fdB375136c32De", "0x3B68a689c929327224dBfCe31C1bf72Ffd2559Ce", "0x9fCB6F75D99029f28F6F4a1d277bae49c5CAC79f"],
  },
})
