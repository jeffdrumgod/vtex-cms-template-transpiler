openssl genrsa -out selfsigned.key 2048
openssl rsa -in selfsigned.key -out selfsigned.key
openssl req -sha256 -new -key selfsigned.key -out selfsigned.csr -subj '/C=US/ST=vtexlocal.online.pro.br/L=vtexlocal.online.pro.br/O=vtexlocal.online.pro.br/CN=127.0.0.1/CN=*.vtexlocal.online.pro.br/CN=localhost'
openssl x509 -req -sha256 -days 1095 -in selfsigned.csr -signkey selfsigned.key -out selfsigned.crt
cat selfsigned.crt selfsigned.key > selfsigned.pem

# openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -nodes -keyout selfsigned.key -out selfsigned.crt -subj "/CN=vtexlocal.online.pro.br" -addext "subjectAltName=DNS:vtexlocal.online.pro.br,DNS:*.vtexlocal.online.pro.br,IP:127.0.0.1"