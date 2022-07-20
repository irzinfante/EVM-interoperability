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
docker run --rm -v $PWD:/var irzinfante/besu:v21.1.1_ibft-reject-empty-blocks sh /var/confgen.sh
```

Por último levantamos la red ejecutando el comando

```sh
docker-compose up -d
```

## Creación del token ERC-20 para la interoperabilidad

En este repositorio el directorio `hardhat` contiene los smart contracts y configuraciones para compilar y desplegar el token ERC-20. Desde el directorio base del proyecto nos situamos en el directorio `hardhat` con

```sh
cd hardhat
```

La compilación y el despliegue se hacen usando **Node.js** (se recomienda usar **npm 7** o posterior). Para configurar el entorno de Node.js ejecutamos

```sh
npm install
```
Antes de continuar con la compilación y el despliegue, creamos el archivo `.env` con el siguiente contenido:

```dosini
MNEMONIC = # String con las palabras del mnemonic de una HD Wallet
BESU_LOCAL_URL = "http://127.0.0.1:8545"
BESU_LOCAL_ID = 657665
ETHEREUM_GOERLI_URL = # String con la URL de conexión a un nodo de la red Görli
BSC_TESTNET_URL = # String con la URL de conexión a un nodo de la tesnet de BSC
BSCSCAN_API_KEY = # String con un api-key de BSCScan (https://bscscan.com/myapikey)
```

El smart contract del token se encuentra en [`contracts/token/EVMtoken.sol`](/hardhat/contracts/token/EVMtoken.sol). Para compilarlo ejecutamos

```sh
npx hardhat compile
```

El resultado de la compilación se encuentra en el directorio `artifacts/contracts/token/EVMtoken.sol/`. El despliegue del smart contract lo haremos usando la segunda address que se genera con el HD Wallet, partiendo del mnemonic proporcionado, usando la ruta de derivación de Ethereum (m/44'/60'/0'/0). Para desplegar el token ERC-20 en la testnet de BSC ejecutamos

```sh
npx hardhat run --network bsc_testnet ./scripts/deployEVMtoken.js
```

Si el despliegue se ha compleado correctamente se devuelve el mensaje

```
A token for interoperability deployed to: 0x...
```

donde `0x...` es el realidad el address en el que se ha desplegado el smart contract, es decir, el address del token.

Por último, podemos verificar el contrato en BSCScan ejecutando

```sh
npx hardhat verify --network bsc_testnet --contract contracts/token/EVMtoken.sol:EVMtoken 0x...
```
