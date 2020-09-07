#!/bin/bash
mkdir /opt/ssl
cd /opt/ssl/
cp /etc/pki/tls/openssl.cnf ./
rm -rf /etc/pki/CA/*.old
touch /etc/pki/CA/index.txt
echo 01 > /etc/pki/CA/serial 
rm -rf certs
mkdir certs
openssl genrsa -out certs/root-ca.key 2048
openssl req -new -x509 -days 365 -config ./openssl.cnf -key certs/root-ca.key -out certs/root-cacert.pem -subj "/C=IN/ST=WB/O=EMQ/CN=RootCA"
openssl x509 -in certs/root-cacert.pem -noout -text
