const { stakings } = require("../helper/staking")

module.exports={
    ethereum:{
        tvl:()=>({}),
        staking: stakings([
            "0x488B813ED84aB52857cA90ade050f8ca126bEda6",
            "0xf9FA02cC165dBd70fF34d27b5AC9E0AE6D74D756",
            "0xE42aDCB4B9F2e3E6acb70399c420Cb6D6795B09d",
            "0xE3507B38342CCB9Aa03E5AF2deA6C1F54351F553",
            "0xf7E1edF3E4EC64360aFB739EBD2c0F40A5CC57D3",
            "0x979a7307Dd7Ba386b52F08a9A35a26807affbCC9"
        ], "0x888cea2bbdd5d47a4032cf63668d7525c74af57a")
    }
}