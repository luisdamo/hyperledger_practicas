### Construimos la imagen de docker
docker build -f pool.dockerfile -t pool-indy-test .
## ver imagenes docker
docker image ls
### Ejecutamos el contenedor
docker run -itd -p 9701:9701 -p 9702:9702 -p 9703:9703 -p 9704:9704 -p 9705:9705 -p 9706:9706 -p 9707:9707 -p 9708:9708 pool-indy-test

### Borramos el estado
rm -rf ~/.indy_client/wallet
### Verificar version de node
nvm ls
nvm use 8.10.0
### Borramos el estado y ejecutar cliente
rm -rf ~/.indy_client/wallet && node open_wallet.js
### Ejecutamos el script del cliente
node open_wallet.js
### Nos conectamos al contenedor
docker exec -it keen_wilbur bash
### Buscamos el bloque de genesis con find
find / | grep genesis
find / -name "genesis*"
cat /var/lib/indy/sandbox/pool_transactions_genesis
Guardamos el contenido en genesis.txt de nuestro entorno
### Creamos el fichero utils.js de los ejemplos de node en indy-sdk
### Creamos open_network.js y añadimos referencia
const util = require('./util.js');
### En el fichero, abrimos el Pool Ledger
let poolGenesisTxnPath = await util.getPoolGenesisTxnPath(poolName)
### y creamos el fichero de configuración
### Estado del contenedor
docker stats
### corregir versiones
wget http://security.ubuntu.com/ubuntu/pool/main/o/openssl1.0/libssl1.0.0_1.0.2n-1ubuntu5.7_amd64.deb
sudo dpkg -i libssl1.0.0_1.0.2n-1ubuntu5.7_amd64.deb
sudo apt install libindy=1.14.2
## Crear DID con semilla que contenga los permisos requeridos
'seed': '000000000000000000000000Steward1'
### Borramos el estado y ejecutar cliente
rm -rf ~/.indy_client/wallet && node full_example.js
### Crear schema
Es necesario cambiar la versión (1.1) del schema cada vez que lo creamos
 let [_id, _schema] = await indy.issuerCreateSchema(did,"SchemaPrueba", "1.1", ["name", "age"])
### Registrar schema
const response = await sendSchema(poolHandler, walletHandler, did, schema)
Es necesario actualizar cada vez la versión del schema

### Registrar credential definition
const [credDefId, credDef] = await indy.issuerCreateAndStoreCredentialDef(walletHandler,did,schema,"TAG",'CL')
### Credential offer (issuer)
### Create master secret
proverCreateMasterSecret ( wh, masterSecretId ) -> outMasterSecretId

Creates a master secret with a given id and stores it in the wallet. The id must be unique.
### Credential request(holder)
proverCreateCredentialReq ( wh, proverDid, credOffer, credDef, masterSecretId ) -> [ credReq, credReqMetadata ]
Creates a credential request for the given credential offer.
### Credential response (holder)
### Credential issuance(issuer)
### Save credential (holder)