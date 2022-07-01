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
