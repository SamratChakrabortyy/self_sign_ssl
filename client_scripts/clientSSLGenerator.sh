KEY_LOC=$1
CN=$2
CA_SERVER=http://192.168.20.172:3000
cd $KEY_LOC
mkdir $CN
openssl genrsa -out $CN/$CN.key 2048
openssl req -new -days 90 -key $CN/$CN.key -out $CN/$CN.csr -subj "/C=US/ST=Baltimore/O=EMQ/CN=$CN"
curl --location --max-time 120 --request POST "$CA_SERVER"'/signCSR' --form 'csrFile=@'"$CN"/"$CN"'.csr' > $CN/$CN.tar.gz
cd $CN
tar xvzf $CN.tar.gz
cp  $CN/* .
rm -rf $CN/
openssl verify -CAfile root-cacert.pem $CN.pem
