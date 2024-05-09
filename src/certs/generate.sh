#!/bin/bash

cat > config_openssl.cnf <<EOF
[dn]
CN = vtexlocal.online.pro.br
[req]
distinguished_name = dn
[EXT]
subjectAltName = DNS:vtexlocal.online.pro.br
keyUsage = digitalSignature
extendedKeyUsage = serverAuth
EOF

openssl req -x509 -out selfsigned.crt -keyout selfsigned.key \
  -newkey rsa:2048 -nodes -sha256 \
  -days 358000 \
  -subj '/CN=vtexlocal.online.pro.br' \
  -extensions EXT -config config_openssl.cnf

rm config_openssl.cnf