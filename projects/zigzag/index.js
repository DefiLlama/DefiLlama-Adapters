const WebSocket = require('ws')

function offers() {
    return new Promise(resolve => {
        const ws = new WebSocket('wss://zigzag-rinkeby.herokuapp.com/');

        ws.on('open', function open() {
            ws.send(JSON.stringify({"op":"subscribemarket","args":[1,"ETH-USDT"]}));
          });
          
        const orders = {}

        ws.on('message', function message(data) {
            const parsedData = JSON.parse(data)
            orders[parsedData.op]=parsedData.args

            if(orders.openorders && orders.liquidity){
                let totalETH = 0;
                orders.openorders[0].forEach(order=>{
                    totalETH += order[5]
                })
                orders.liquidity[2].forEach(order=>{
                    totalETH += order[0]*2
                })
                resolve({
                    "ethereum": totalETH
                })
            }
        });
    })
}

module.exports = {
    zksync:{
        offers,
        tvl: async()=>({})
    }
}