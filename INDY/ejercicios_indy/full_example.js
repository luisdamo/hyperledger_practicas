var indy = require('indy-sdk')
const util = require('./util.js');
const encoder = require('./encoder.js')
async function connect() {
    try {
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

            if (e.message !== "PoolLedgerConfigAlreadyExistsError") {
                throw e;
                console.log("Error creando pool ledger config file" + e)
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
async function openWallet(config, credentials) {
    let walletHandler = 0;
    try {
        await indy.createWallet(config, credentials);
        walletHandler = await indy.openWallet(config, credentials);

        return walletHandler;
    } catch (err) {
        console.error(err)
        return
    }
}

async function createDid(walletHandler) {
    //Creamos nuestro DID
    let did, verkey;
    try {
        console.log("creando DID...")
        console.log("Creando DID con seed");
        let DidInfo = {
            'seed': '000000000000000000000000Steward1'
        };
        let [_did, _verkey] = await indy.createAndStoreMyDid(walletHandler, DidInfo)
        //console.log("DID:" + _did)
        //console.log("VERKEY" + _verkey)
        did = _did
        verkey = _verkey
        return { did, verkey };
    } catch (err) {
        console.error('Ha ocurrido un error al crear el DID:' + err)
        return
    }
}

async function createSchema(did) {
    //Creamos nuestro SCHEMA
    let id, schema;
    try {
        console.log("creando SCHEMA...")
        let [_id, _schema] = await indy.issuerCreateSchema(did, "SchemaPrueba", "1.4", ["name", "age"])
        id = _id;
        schema = _schema;
        return { id, schema }
    } catch (err) {
        console.error('Ha ocurrido un error al crear el SCHEMA:' + err)
        return
    }
}
async function sendNym(poolHandle, walletHandle, Did, newDid, newKey, role) {
    let nymRequest = await indy.buildNymRequest(Did, newDid, newKey, null, role);
    await indy.signAndSubmitRequest(poolHandle, walletHandle, Did, nymRequest);
}

async function sendSchema(poolHandle, walletHandle, Did, schema) {
    // schema = JSON.stringify(schema); // FIXME: Check JSON parsing
    console.log("ejecutando sendSchema poolHandle:" + poolHandle + " walletHandle:" + walletHandle + " Did:" + Did + "schema:" + schema)
    let schemaRequest = await indy.buildSchemaRequest(Did, schema);
    return await indy.signAndSubmitRequest(poolHandle, walletHandle, Did, schemaRequest)


}

async function sendCredDef(poolHandle, walletHandle, did, credDef) {
    let credDefRequest = await indy.buildCredDefRequest(did, credDef);
    return await indy.signAndSubmitRequest(poolHandle, walletHandle, did, credDefRequest);
}

async function getSchema(poolHandle, did, schemaId) {
    let getSchemaRequest = await indy.buildGetSchemaRequest(did, schemaId);
    let getSchemaResponse = await indy.submitRequest(poolHandle, getSchemaRequest);
    return await indy.parseGetSchemaResponse(getSchemaResponse);
}

async function getCredDef(poolHandle, did, schemaId) {
    let getCredDefRequest = await indy.buildGetCredDefRequest(did, schemaId);
    let getCredDefResponse = await indy.submitRequest(poolHandle, getCredDefRequest);
    return await indy.parseGetCredDefResponse(getCredDefResponse);
}
async function main() {

    const config = { "id": "jld" };
    const credentials = { "key": "Sindosa2022" };
    try {
        let walletHandler = await openWallet(config, credentials)
        console.log("walletHandler creado" + walletHandler)
        let { did, verkey } = await createDid(walletHandler)
        console.log("DID:" + did)
        console.log("VERKEY:" + verkey)
        //Conectar a la red
        let poolHandler = await connect()
        console.log("pool handler value:" + poolHandler)
        //Crear schema
        let { id, schema } = await createSchema(did)
        console.log("SCHEMA1 id:" + id)
        console.log("SCHEMA:" + JSON.stringify(schema, null, 4))
        //Registrar el esquema
        const response = await sendSchema(poolHandler, walletHandler, did, schema)
        console.log("register schema response:" + JSON.stringify(response))
        //Obtener el schema
        let [, readedSchema] = await getSchema(poolHandler, did, id)
        console.log("get schema response:" + JSON.stringify(readedSchema))
        schema = readedSchema;
        //Definir credenciales
        let [credDefId, credDef] = await indy.issuerCreateAndStoreCredentialDef(walletHandler, did, schema, "TAG", 'CL', '{"support_revocation":false}');
        console.log("Definición de credenciales credDefId:" + credDefId)
        console.log("Definición de credenciales credDef:" + JSON.stringify(credDef))
        //Registrar en la red
        let credRegistrationResp = await sendCredDef(poolHandler, walletHandler, did, credDef)
        console.log("send registration response:" + JSON.stringify(credRegistrationResp))
        //Crear la oferta
        let credOffer = await indy.issuerCreateCredentialOffer(walletHandler, credDefId)
        console.log("send credential offer:" + JSON.stringify(credOffer))
        //Crear Master Secret
        let masterSecretId = "";
        try {
            masterSecretId = await indy.proverCreateMasterSecret(walletHandler, null)
            console.log("create master master secret:" + masterSecretId)
        } catch (err) {
            console.error("Error creando master secret" + err)
            throw err
        }
        let [credReq, credReqMetadata] = await indy.proverCreateCredentialReq(walletHandler,did,credOffer,credDef,masterSecretId)
        console.log("create credential req:" + credReq)
        console.log("create credential request metadata:" + JSON.stringify(credReqMetadata))
        //issuerCreateCredential
        let values = {
            "name": {"raw": "jose luis", "encoded": encoder.encodeCredValue('value1_as_int')},
            "age": {"raw": "52", "encoded": "52"}
        }
        console.log("Datos de credencial" + JSON.stringify(values))
        let [cred, credRevocId, revocReqDelta] = await indy.issuerCreateCredential(walletHandler, credOffer,credReq,values,null, -1 )                
        console.log("IssuerCreateCredential cred " + JSON.stringify(cred))
        console.log("IssuerCreateCredential credRevocId" + credRevocId)
        console.log("IssuerCreateCredential revocReqDelta" + revocReqDelta)

        //proverCreateCredential( wh, proverDid, credOffer, credDef, masterSecretId )
        //Cerrar pool
        await indy.closePoolLedger(poolHandler)
    } catch (err) {
        console.error("Error en main" + err)
    }

}

(async () => {
    await main();
})();