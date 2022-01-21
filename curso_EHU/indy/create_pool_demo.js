const indy = require('indy-sdk');
const util = require('./util.js');

// para limpiar los ficheros que crea indy en el ordenador
// rm -rf $HOME/.indy_client/ /tmp/indy

// para ejecutar el contenedor con la red de ejemplo
// docker run --rm -itd -p 9701-9708:9701-9708 indy-node:latest

// nos metemos dentro del contenedor
// docker exec -it 44ce0a8074ca bash

// carpetas de interes
// ls /etc/indy/
// ls /var/lib/indy/sandbox

// la localizacion del fichero genesis es
// /var/lib/indy/sandbox/pool_transactions_genesis

async function sendSchema(poolHandle, walletHandle, Did, schema) {
    const schemaRequest = await indy.buildSchemaRequest(Did, schema);
    console.log("contenido del objeto schema request:")
    console.log(JSON.stringify(schemaRequest, null, 4))
    return await indy.signAndSubmitRequest(poolHandle, walletHandle, Did, schemaRequest)
}

async function getSchema(poolHandle, did, schemaId) {
    let getSchemaRequest = await indy.buildGetSchemaRequest(did, schemaId);
    let getSchemaResponse = await indy.submitRequest(poolHandle, getSchemaRequest);
    return await indy.parseGetSchemaResponse(getSchemaResponse);
}

// RUST_BACKTRACE=1 TEST_POOL_IP=127.0.0.1 node create_pool_demo.js
(async () => {
    try {
        // activamos el modo debug para tener más información de los errores que ocurran
        //indy.setRuntimeConfig({ collect_backtrace: true })
        //indy.setDefaultLogger("debug");

        // creamos la configuracion para conectarnos a la red (pool)
        console.log("creando conexion con pool...");
        const poolName = "pool_config_demo"
        try {
            const path = await util.getPoolGenesisTxnPath(poolName)
            console.log("path value: ", path);
            const config = {
                "genesis_txn": path,
            }
            await indy.createPoolLedgerConfig(poolName, config);
        } catch (err) {
            console.log("pool already exist detected!!")
            console.error(err)
        }
        // ajustamos la version del protocolo a usar. A partir de indy 1.4 se usa el 2
        await indy.setProtocolVersion(2);

        // nos conectamos a la red (pool)
        console.log("opening pool ledger connection with pool name: ", poolName)
        let poolHandle = await indy.openPoolLedger(poolName);
        console.log("pool handler id: ", poolHandle);

        // access to did
        const config = {
            id: "sergio"
        };
        const credential = {
            key: "una-clave-por-defecto"
        };
        let wh = await indy.openWallet(config, credential);
        let stewardDidInfo = {
            'seed': '000000000000000000000000Steward1'
        };
        const [did, verkey] = await indy.createAndStoreMyDid(wh, stewardDidInfo);
        console.log("DID: " + did);
        console.log("VERKEY: " + verkey)

        const [schemaId, schema] = await indy.issuerCreateSchema(
            did,
            'Job-Certificate',
            '0.3',
            ['first_name', 'last_name', 'salary', 'employee_status',
                'experience']
        );
        console.log(schemaId);
        console.log(schema);

        // register the schema
        try {
            const response = await sendSchema(poolHandle, wh, did, schema);
            console.log(response);
            // create credential definition
            const [credDefId, defJson] = await indy.issuerCreateAndStoreCredentialDef(
                wh,
                did,
                schema,
                'TAG1',
                'CL',
                '{"support_revocation": false}'
            );
            console.log(credDefId);
            console.log(defJson);
        } catch (err) {
            console.error("error:" + err)
        }

        // const didList = await indy.listMyDidsWithMeta(wh);
        //console.log(didList);
    } catch (e) {
        console.error(e);
    }
})();