const USDW_TOKEN_CONTRACT = '0xab670FDfb0060BDC6508B84a309ff41b56CCAf3f';
const LOCK_USDW_CONTRACT = '0x231fB0E6AD5d975151fC8d5b5C5EB164D265fE85';
const LOCK_VESTEDUSDW_CONTRACT = '0xaf1df90d39EF21107343a77C37297F10768274F5';
const SAVINGS_USDW_CONTRACT = '0xfB379c1f5431E8065e987B36C9BDAF93cba18740';

const WINK_TOKEN_CONTRACT = '0x8c3441E7B9aA8A30a542DDE048dd067DE2802E9B';
const LOCK_WINK_CONTRACT = '0x49C4EeC1d4fFFcdFF415E0757F01Cc50eeF5d4FD';

const WINK_LAUNCH_BLOCK = 66298153;
const WINK_LAUNCH_TIMESTAMP = 1736001563;

async function tvl(api) {

    // latest block

    const toBlock = await api.getBlock();


    // USDW
    
    const lockUsdwBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: USDW_TOKEN_CONTRACT,
        params: [LOCK_USDW_CONTRACT],
    });

    const savingsUsdwBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: USDW_TOKEN_CONTRACT,
        params: [SAVINGS_USDW_CONTRACT],
    });

    const amounts = {};

    const lockVestedUsdwActiveLocks = await Promise.all([
        api.getLogs({
            target: LOCK_VESTEDUSDW_CONTRACT,
            topic: "Deposit(uint256,uint256,uint8)",
            eventAbi: "event Deposit(uint256 tokenId, uint256 amount, uint8 lockPeriod)",
            toBlock,
            fromBlock: WINK_LAUNCH_BLOCK
        }),
        api.getLogs({
            target: LOCK_VESTEDUSDW_CONTRACT,
            topic: "Withdraw(uint256)",
            eventAbi: "event Withdraw(uint256 tokenId)",
            toBlock,
            fromBlock: WINK_LAUNCH_BLOCK
        })
    ]).then(([deposits, withdraws]) =>
        deposits.concat(withdraws).reduce((acc, log) => {
            if(log.name === 'Deposit') {
                const [tokenId, amount] = log.args;

                if(amounts[tokenId.toString()] !== undefined)
                    acc -= amounts[tokenId.toString()];

                amounts[tokenId.toString()] = amount;
                acc += amount;
            } else if(log.name === 'Withdraw') {
                const [tokenId] = log.args;

                if(amounts[tokenId.toString()] !== undefined)
                    acc -= amounts[tokenId.toString()];

                amounts[tokenId.toString()] = 0n;
            }

            return acc;
        }, 0n)
    )

    api.add(USDW_TOKEN_CONTRACT, lockUsdwBalance)
    api.add(USDW_TOKEN_CONTRACT, savingsUsdwBalance)
    api.add(USDW_TOKEN_CONTRACT, lockVestedUsdwActiveLocks)    


    // WINK

    const lockWinkBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: WINK_TOKEN_CONTRACT,
        params: [LOCK_WINK_CONTRACT],
    });

    api.add(WINK_TOKEN_CONTRACT, lockWinkBalance)
}

module.exports = {
  methodology: 'counts the number of USDW tokens in the LockUSDW contract, the number of USDW tokens in the sUSDW contract, the sum of the deposited vUSDW tokens deposited in LockVestedUSDW contract and not yet withdrawed, the number of WINK tokens in the LockWINK contract.',
  start: WINK_LAUNCH_BLOCK,
  timetravel: false,
  hallmarks: [
    [WINK_LAUNCH_TIMESTAMP, "WINK Finance Launch"],
  ],
  polygon: {
    tvl,
  }
}; 
