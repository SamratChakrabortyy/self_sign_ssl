FROM centos:7
RUN yum install openssl -y


RUN mkdir -p /usr/src/ca
RUN mkdir -p /opt/ssl/certs
RUN mkdir -p /opt/clientKeys/certs/
RUN mkdir -p /opt/ssl/client/CSR

COPY root* /opt/ssl/certs/
COPY openssl.cnf /opt/ssl/
COPY keySignScript.sh /opt/ssl/

RUN touch /etc/pki/CA/index.txt
RUN echo 01 > /etc/pki/CA/serial


RUN curl -sL https://rpm.nodesource.com/setup_10.x | bash -
RUN yum install nodejs -y

# Create app directory
WORKDIR /usr/src/ca/server/

COPY . /usr/src/ca
RUN cd /usr/src/ca/server/ && npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source

EXPOSE 3000
CMD [ "node","." ]
