#!/bin/sh

echo -n "Creando configuracion..."

echo 'logging="INFO"' >> /tmp/config.toml
echo '' >> /tmp/config.toml
echo 'data-path="/var/besu"' >> /tmp/config.toml
echo 'node-private-key-file="/var/besu/keys/key"' >> /tmp/config.toml
echo 'genesis-file="/var/besu/config/genesis.json"' >> /tmp/config.toml
echo 'min-gas-price=100' >> /tmp/config.toml
echo '' >> /tmp/config.toml
echo 'bootnodes=[' >> /tmp/config.toml
echo '"enode://'$(cut -c 3- /var/VAL_1/keys/key.pub)'@127.0.0.1:30001",' >> /tmp/config.toml
echo '"enode://'$(cut -c 3- /var/VAL_2/keys/key.pub)'@127.0.0.1:30002",' >> /tmp/config.toml
echo '"enode://'$(cut -c 3- /var/VAL_3/keys/key.pub)'@127.0.0.1:30003",' >> /tmp/config.toml
echo '"enode://'$(cut -c 3- /var/VAL_4/keys/key.pub)'@127.0.0.1:30004",' >> /tmp/config.toml
echo '"enode://'$(cut -c 3- /var/REG_1/keys/key.pub)'@127.0.0.1:30005"' >> /tmp/config.toml
echo ']' >> /tmp/config.toml

for nodo in VAL_1 VAL_2 VAL_3 VAL_4 REG_1; do
	mkdir -p /var/${nodo}/config && cp /tmp/config.toml /var/${nodo}/config/config.toml
done

echo '' >> /var/REG_1/config/config.toml
echo 'host-allowlist=["*"]' >> /var/REG_1/config/config.toml
echo '' >> /var/REG_1/config/config.toml
echo 'rpc-http-enabled=true' >> /var/REG_1/config/config.toml
echo 'rpc-http-host="0.0.0.0"' >> /var/REG_1/config/config.toml
echo 'rpc-http-cors-origins=["*"]' >> /var/REG_1/config/config.toml
echo 'rpc-http-api=["ETH","NET","WEB3","ADMIN","TXPOOL"]' >> /var/REG_1/config/config.toml
echo '' >> /var/REG_1/config/config.toml
echo 'rpc-ws-enabled=true' >> /var/REG_1/config/config.toml
echo 'rpc-ws-host="0.0.0.0"' >> /var/REG_1/config/config.toml
echo 'rpc-ws-api=["ETH","NET","WEB3","ADMIN","TXPOOL"]' >> /var/REG_1/config/config.tomls

echo '[' >> /tmp/2encode.json
echo '"'$(cat /var/VAL_1/keys/nodeAddress)'",' >> /tmp/2encode.json
echo '"'$(cat /var/VAL_2/keys/nodeAddress)'",' >> /tmp/2encode.json
echo '"'$(cat /var/VAL_3/keys/nodeAddress)'",' >> /tmp/2encode.json
echo '"'$(cat /var/VAL_4/keys/nodeAddress)'"' >> /tmp/2encode.json
echo ']' >> /tmp/2encode.json

echo '{' >> /tmp/genesis.json
echo '  "config": {' >> /tmp/genesis.json
echo '    "chainId": 657665,' >> /tmp/genesis.json
echo '    "constantinoplefixblock": 0,' >> /tmp/genesis.json
echo '    "ibft2": {' >> /tmp/genesis.json
echo '      "blockperiodseconds": 1,' >> /tmp/genesis.json
echo '      "epochlength": 30000,' >> /tmp/genesis.json
echo '      "requesttimeoutseconds": 3,' >> /tmp/genesis.json
echo '      "miningbeneficiary": "0xd331C36e919f773f0D9B5cAbff5F80C0793a3DB8"' >> /tmp/genesis.json
echo '    }' >> /tmp/genesis.json
echo '  },' >> /tmp/genesis.json
echo '  "nonce": "0x0",' >> /tmp/genesis.json
echo '  "timestamp": "0x5E26C3F7",' >> /tmp/genesis.json
echo '  "gasLimit": "0x989680",' >> /tmp/genesis.json
echo '  "difficulty": "0x1",' >> /tmp/genesis.json
echo '  "mixHash": "0x63746963616c2062797a616e74696e65206661756c7420746f6c6572616e6365",' >> /tmp/genesis.json
echo '  "alloc": {' >> /tmp/genesis.json
echo '    "0xd331C36e919f773f0D9B5cAbff5F80C0793a3DB8": {' >> /tmp/genesis.json
echo '      "comment": "EVM-interoperability Preprovisioning Account",' >> /tmp/genesis.json
echo '      "balance": "0x115EEC47F6CF7E35000000"' >> /tmp/genesis.json
echo '    }' >> /tmp/genesis.json
echo '  },' >> /tmp/genesis.json
echo '  "extraData": "'$(besu rlp encode --from=/tmp/2encode.json --type=IBFT_EXTRA_DATA)'"' >> /tmp/genesis.json
echo '}' >> /tmp/genesis.json

for nodo in VAL_1 VAL_2 VAL_3 VAL_4 REG_1; do
	cp /tmp/genesis.json /var/${nodo}/config/genesis.json
done

echo " Terminado!"