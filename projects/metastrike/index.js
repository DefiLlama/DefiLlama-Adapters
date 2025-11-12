
const {  stakings } = require('../helper/staking')
// // Token MTS
const MTS_TOKEN = '0x496cC0b4ee12Aa2AC4c42E93067484e7Ff50294b'

//  Vesting contracts
const VestingCEXV1 = '0x8be5ee50f10a2ff7313b24cacfc21639bef48b60'
const VestingCEXV2 = '0xfd9ea0e249293f9589e18d8ce8973ce985e90e52'
const VestingAdvisors = '0x37976466F68C7b74BeA901E49263F8C7E081d42D'
const VestingTeam = '0x263718B1DFECa8b49406FD4FD1aC5aFD05619d69'
const VestingMarketing = '0x5573a696262362218331c9bA832315205D4289e0'

// 
const StakingV1 = '0x3668b1fbba7ea689901b5ab530401cc0134322c6'
const StakingV2Pool1 = '0xb5ec84087352463f21a7ec54d342319bb95bc351'
const StakingV2Pool2 = '0xEBc4691b9e28AaE15B5439352c9e50A7b6E76B79'
const StakingV2Pool3 = '0x49Ae88cc37fbcAcA51f412707BE81b933Cd4AD5e'
const StakingV2Pool4 = '0x38dcC010518E266372DD574fA74a03ccb38Fd30d'
const StakingV2Pool5 = '0x6C7EbB352F92003Aa767675a7a4062ca74206e19'
const StakingV2Pool6 = '0x05dE10e375b03e9072f4ac7b1166CCfee53E7003'

module.exports = {
        methodology: "Total Value Lock in Metastrike protocol is calculated by sum of: Staking and Vesting locked value",
    bsc: {
        staking: stakings([StakingV1, StakingV2Pool1, StakingV2Pool2, StakingV2Pool3, StakingV2Pool4, StakingV2Pool5, StakingV2Pool6], MTS_TOKEN),
        vesting: stakings([VestingCEXV1, VestingCEXV2, VestingAdvisors, VestingTeam, VestingMarketing], MTS_TOKEN),
        tvl: () => ({}),
    }
} 