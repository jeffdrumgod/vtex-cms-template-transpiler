openssl req -x509 -out selfsigned.crt -keyout selfsigned.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=vtexlocal.online.pro.br' \
  -extensions EXT -config <(printf "[dn]\nCN=vtexlocal.online.pro.br\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:vtexlocal.online.pro.br\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")