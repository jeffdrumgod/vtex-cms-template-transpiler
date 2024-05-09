#!/bin/bash

cat > config_openssl.cnf <<EOF
[ req ]
default_bits = 2048
prompt = no
default_md = sha256
x509_extensions = v3_req
distinguished_name = dn

[ dn ]
C = BR
ST = YourState
L = YourCity
O = YourOrganization
OU = YourOrganizationalUnit
CN = *.vtexlocal.online.pro.br

[ v3_req ]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[ alt_names ]
DNS.1 = *.vtexlocal.online.pro.br
DNS.2 = vtexlocal.online.pro.br
EOF

openssl req -x509 -nodes -days 358000 -newkey rsa:2048 -keyout selfsigned.key -out selfsigned.crt -config config_openssl.cnf

rm config_openssl.cnf
