# Interoperabilidad entre redes blockchain EVM compatibles

En este proyecto exploramos un caso de interoperabilidad entre las tesnets públicas de Ethereum, de Binance, y una red privada de Hyperledger Besu, mediante el uso de bridges para un token ERC-20.

Para descargar este repositorio ejecutamos el siguiente comando en la terminal:

```sh
git clone https://github.com/irzinfante/EVM-interoperability.git
```

Y nos situamos dentro del directorio base del proyecto con

```sh
cd EVM-interoperability
```

## Configuración y puesta en marcha de la red Besu

En este repositorio el directorio `besu` contiene los scripts y configuraciones para crear la red Besu. Desde el directorio base del proyecto nos situamos en el directorio `besu` con

```sh
cd besu
```

La red se levanta con **docker** y **docker-compose**. La versión de Besu que utilizamos es una [modificación de la versión 21.1.1](https://github.com/irzinfante/besu/tree/v21.1.1/ibft-reject-empty-blocks) para evitar la creación de bloques vacíos. Para crear una imagen base de docker para trabajar con esta versión de Besu ejecutamos

```sh
docker build -t irzinfante/besu:v21.1.1_ibft-reject-empty-blocks besu-base/
```

En la construcción de la imagen `irzinfante/besu:v21.1.1_ibft-reject-empty-blocks` se compila el cliente de Besu a partir del código fuente. Para no tener hacer esta compilación, si no se quiere, se ha publicado esta misma imagen en [Docker Hub](https://hub.docker.com/layers/besu/irzinfante/besu/v21.1.1_ibft-reject-empty-blocks/images/sha256-76d52496a61f2be2125ec2846b137ad2eeb568845c9445402d590a1222a041de?context=explore).

Tras esto se pueden ejecutar los scripts para generar las claves criptográficas de los nodos de la red y generar los archivos de configuración para cada nodo. Para ello utilizamos contenedores temporales, con nuestra imagen particular, a los que les pasamos los scripts pertinentes de la siguiente manera:

```sh
docker run --rm -v $PWD:/var irzinfante/besu:v21.1.1_ibft-reject-empty-blocks sh /var/keygen.sh
docker run --rm -v $PWD:/var irzinfante/besu:v21.1.1_ibft-reject-empty-blocks sh /var/confgen.sh 0x...
```

donde `0x...` es la address que se utilizará tanto para distribuir los 21M de la divisa nativa de esta red que se pre-minan en el bloque génesis como para recibir las comisiones de las transacciones al minar nuevos bloques.

Por último levantamos la red ejecutando el comando

```sh
docker-compose up -d
```

## Creación del token ERC-20 para la interoperabilidad

En este repositorio el directorio `hardhat` contiene los smart contracts y configuraciones para compilar y desplegar el token ERC-20. Desde el directorio base del proyecto nos situamos en el directorio `hardhat` con

```sh
cd hardhat
```

La compilación y el despliegue se hacen usando el framework **Hardhat** (se recomienda usar **npm 7** o posterior). Para configurar el entorno de Node.js ejecutamos

```sh
npm install
```
Antes de continuar con la compilación y el despliegue, creamos el archivo `.env` con el siguiente contenido:

```dosini
MNEMONIC = # String con las palabras del mnemonic de una HD Wallet
BESU_LOCAL_URL = "http://127.0.0.1:8545"
ETHEREUM_GOERLI_URL = # String con la URL de conexión a un nodo de la red Görli
BSC_TESTNET_URL = # String con la URL de conexión a un nodo de la tesnet de BSC
BSCSCAN_API_KEY = # String con un api-key de BSCScan (https://bscscan.com/myapikey)
ETHERSCAN_API_KEY = # String con un api-key de Etherscan (https://etherscan.io/myapikey)
```

El smart contract del token se encuentra en [`contracts/token/EVMtoken.sol`](/hardhat/contracts/token/EVMtoken.sol). Para compilarlo ejecutamos

```sh
npx hardhat compile
```

El resultado de la compilación se encuentra en el directorio `artifacts/contracts/token/EVMtoken.sol/`. El despliegue del smart contract lo haremos usando la segunda address del HD Wallet (derivation path `m/44'/60'/0'/0/1`) generada con el mnemonic proporcionado. Para desplegar el token ERC-20 en la testnet de BSC, haciendo un pre-acuñado de 10M unidades del token, ejecutamos

```sh
npx hardhat run --network bsc_testnet ./scripts/deployEVMtokenPreMint.js
```

Si el despliegue se ha compleado correctamente se devuelve el mensaje

```
A token for interoperability deployed to: 0x...
Preminted 10,000,000 EVM tokens
```

donde `0x...` es el address en el que se ha desplegado el smart contract, es decir, el address del token.

Igualmente, para desplegar el token ERC-20 en la testnet Görli de Ethereum y en la red local Besu, sin pre-acuñar el token, ejecutamos los siguientes dos comandos:

```sh
npx hardhat run --network ethereum_goerli ./scripts/deployEVMtoken.js
npx hardhat run --network besu_local ./scripts/deployEVMtoken.js
```

Por último, podemos verificar el contrato en BSCScan o Etherscan ejecutando los siguientes comandos, donde `0x...` es el address del contrato desplegado en cada una de la redes,

```sh
npx hardhat verify --network bsc_testnet --contract contracts/token/EVMtoken.sol:EVMtoken 0x... 10000000
npx hardhat verify --network ethereum_goerli --contract contracts/token/EVMtoken.sol:EVMtoken 0x... 0
```

## Despliegue y configuración de smart contracts de los bridges

En este repositorio el directorio `hardhat` contiene los smart contracts y configuraciones para compilar y desplegar los contratos de los bridges. Desde el directorio base del proyecto nos situamos en el directorio `hardhat` con

```sh
cd hardhat
```

El smart contract del bridge se encuentra en [`contracts/bridge/Bridge.sol`](/hardhat/contracts/bridge/Bridge.sol). Para compilarlo ejecutamos

```sh
npx hardhat compile
```

Para desplegar el contrato hay que pasar como parámetro al constructor la dirección del token EVM en cada red. Para ello, en el directorio actual, creamos el archivo `tokenAddress.json` con el siguiente contenido:

```json
{
  "BSC_TESTNET_EMV_TOKEN_ADDRESS": "0x...",
  "GOERLI_TESTNET_EMV_TOKEN_ADDRESS": "0x...",
  "BESU_LOCAL_EMV_TOKEN_ADDRESS": "0x..."
}
```

donde para cada `0x...` hay que indicar la address del token EVM en la red correspondiente. Para desplegar el contrato en las distintas redes ejecutamos estos comandos:

 - **BSC testnet**
  ```sh
  npx hardhat run --network bsc_testnet ./scripts/deployBridgeToBSCTestnet.js
  ```

 - **Göerli testnet**
  ```sh
  npx hardhat run --network ethereum_goerli ./scripts/deployBridgeToGoerliTestnet.js
  ```

 - **Besu local**
  ```sh
  npx hardhat run --network besu_local ./scripts/deployBridgeToBesuLocal.js
  ```

El mensaje de respuesta de cada uno de los comandos informa de la address en la que se ha desplegado el contrato.

Por último, para verificar los smart contracts en las testnet de BSC y Ethereum podemos ejecutar los comandos

 - **BSC testnet**
  ```sh
  npx hardhat verify --network bsc_testnet --contract contracts/bridge/Bridge.sol:Bridge 0x.. 0x..
  ```

 - **Göerli testnet**
  ```sh
  npx hardhat verify --network ethereum_goerli --contract contracts/bridge/Bridge.sol:Bridge 0x.. 0x..
  ```

donde, en cada comando, el primer `0x...` debe ser la address donde se ha desplegado el contrato del bridge y el segundo `0x...` debe ser la address del token EVM en la red correspondiente.

## Configuración y despliegue del oráculo

En este repositorio el directorio `oracle` contiene el código para desplegar el oráculo. Desde el directorio base del proyecto nos situamos en el directorio `oracle` con

```sh
cd oracle
```

Antes de desplegar el oráculo, creamos el archivo `.env` con el siguiente contenido:

```dosini
# NODES WS URL
BSC_TESTNET_NODE=ws://...
GOERLI_TESTNET_NODE=ws://...
BESU_LOCAL_NODE=ws://127.0.0.1:8546

# BRIDGE CONTRACTS ADDRESSES
BSC_BRIDGE_ADDRESS=0x..
GOERLI_BRIDGE_ADDRESS=0x..
BESU_BRIDGE_ADDRESS=0x..

# HD WALLET MNEMONIC
MNEMONIC=
```

donde sustituimos `ws://...` por la correspondiente URL del WebSocket del nodo y `0x...` por la correspondiente address del smart contract del bridge para cada red. El valor asignado a la variable `MNEMONIC` deben ser las palabras del mnemonic de una HD wallet separadas por espacios. El oráculo ejecutará los métodos de los smart contracts de los bridges usando la segunda address del HD Wallet (derivation path `m/44'/60'/0'/0/1`) generada con el mnemonic proporcionado.

El oráculo se despliega con **docker** y **docker-compose**. Para iniciar el oráculo ejecutamos el comando

```sh
docker-compose up -d
```

## Configuración y despliegue de la dApp

En este repositorio el directorio `dapp` contiene el código para desplegar la dApp. Desde el directorio base del proyecto nos situamos en el directorio `dapp` con

```sh
cd dapp
```

Antes de construir y desplegar la aplicación, creamos el archivo `.env` con el siguiente contenido:

```dosini
# NODES WS URL
BSC_TESTNET_NODE=ws://...
GOERLI_TESTNET_NODE=ws://...
BESU_LOCAL_NODE=ws://127.0.0.1:8546

# BRIDGE CONTRACTS ADDRESSES
BSC_BRIDGE_ADDRESS=0x..
GOERLI_BRIDGE_ADDRESS=0x..
BESU_BRIDGE_ADDRESS=0x..

# EVM TOKEN CONTRACTS ADDRESSES
BSC_EVM_TOKEN_ADDRESS=0x..
GOERLI_EVM_TOKEN_ADDRESS=0x..
BESU_EVM_TOKEN_ADDRESS=0x..
```

donde sustituimos `ws://...` por la correspondiente URL del WebSocket del nodo y `0x...` por la correspondiente address del smart contract del bridge o del token EVM para cada red.

La aplicación se construye y despliega con **docker** y **docker-compose**. Para ello ejecutamos el comando

```sh
docker-compose up -d
```

y esperamos a que el proceso de construcción finalice y el contenedor de Docker esté corriendo. La dApp será accesible desde [http://localhost/](http://localhost/).

> **_NOTA:_**  Esta dApp está hecha en **Angular 2** y se ejecuta íntegramente en el navegador. Por lo que para modificar las URLs de los nodos y/o las direcciones de los nodos se debe modificar el archivo `.env`, ejecutar el comando `docker-compose down` para parar el contenedor actual y ejecutar el comando `docker-compose up --build -d` para reconstruir la imagen de Docker y levantar el contenedor de nuevo.
