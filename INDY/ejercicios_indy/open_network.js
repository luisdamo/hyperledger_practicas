var indy = require('indy-sdk')
const util = require('./util.js');
async function connect() {
    try{
        let poolName = 'pool1';
        console.log('Open Pool Ledger:' + poolName)
        let poolGenesisTxnPath = await util.getPoolGenesisTxnPath(poolName)
        console.log("Connection file created at" + poolGenesisTxnPath);
        let poolConfig = {
            "genesis_txn": poolGenesisTxnPath
        };
        try {
              console.log("creando pool ledger config file")
              await indy.createPoolLedgerConfig(poolName, poolConfig);
        } catch (e) {
            console.log("Error creando pool ledger config file" + e)
            if (e.message !== "PoolLedgerConfigAlreadyExistsError") {
                throw e;
            }
        }
        console.log("setting indy protocol version 2")
        await indy.setProtocolVersion(2)
        console.log("opening connection...")
        let poolHandle = await indy.openPoolLedger(poolName);
        return poolHandle
    } catch (err) {
        console.error("fallo al abrir el pool handler " + err)
    }
   
}
async function main() {    
    try{
        const poolHandler = await connect();
        console.log("pool handler value" + poolHandler)
        await indy.closePoolLedger(poolHandler)
    } catch (err) {
        console.error("fallo al obtener el pool handler " + err)
    }
}

(async () =>{
    await main();
})();
