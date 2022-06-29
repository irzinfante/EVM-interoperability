#!/bin/sh

echo -n "Generando claves..."

i=0
for nodo in VAL_1 VAL_2 VAL_3 VAL_4 REG_1; do
	besu --data-path=/var/${nodo}/keys public-key export --to=/var/${nodo}/keys/key.pub > /dev/null 2>&1
	echo -ne '\rGenerando claves... '$((i*20 + 10))'%'
	besu --data-path=/var/${nodo}/keys public-key export-address --to=/var/${nodo}/keys/nodeAddress > /dev/null 2>&1
	i=$i+1 && echo -ne '\rGenerando claves... '$((i*20))'%'
done

echo -e "\rGenerando claves... Terminado!"