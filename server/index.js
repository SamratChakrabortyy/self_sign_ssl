const express = require('express');
const {
    logger,
    httpLogger
} = require('./utils/logger');
const app = express();
const bodyParser = require('body-parser');
const log4js = require('log4js');
const port = 3000;
const inputCSRDir = "/opt/ssl/client/CSR";
const csrSigningScipt = "./keySignScript.sh";
const caDir = "/opt/ssl"
const multer = require('multer');
const upload = multer({
    dest: inputCSRDir
});
const execSync = require('child_process').execSync;
const path = require('path');

app.post('/signCSR', upload.single('csrFile'), (req, res, next) => {
    logger.info('Inside Sign CSR');
    try {
        if (req.file == undefined) {
            logger.error("No file found")
            return res.status(400).send('No files were uploaded.');
        }
        let fileDetails = JSON.parse(JSON.stringify(req.file));
        if (fileDetails == undefined || fileDetails.size == undefined || fileDetails.size <= 0) {
            logger.error("No file found")
            return res.status(400).send('No files were uploaded.');
        }
        logger.info(`CSR file details: ${JSON.stringify(fileDetails)}`);
        let csrFilePath = fileDetails.path;
        let csrFileName = fileDetails.originalname;
        if (csrFileName.indexOf('.csr') != csrFileName.length - 4) {
            logger.error(`File type not CSR`);
            return res.status(400).send(`File Type not CSR`);
        }
        logger.info(`File with name ${csrFileName} successfully saved at ${csrFilePath}`);
        try {
            let days = req.body.days;
            days = days == undefined ? 90 : days;
            logger.debug(`Days for certificate being active ${days}`);
            logger.info(`Attempting to sign ${csrFileName}`);
            let tarFileName = execSync(`${csrSigningScipt} ${csrFilePath} ${csrFileName.substring(0, csrFileName.lastIndexOf(".csr"))} ${days}`, {
                timeout: 60 * 1000,
                cwd : caDir
            }).toString('utf8');
            tarFileName = tarFileName.replace(/\r?\n|\r/g, "");
            logger.info(`Public key location for ${csrFileName}: ${tarFileName}`);
            let resolvedPath = path.resolve(tarFileName);
            res.header('Content-Type', 'text/plain');
            res.header('Content-Encoding', 'gzip');
            res.attachment(`${csrFileName}.tar.gz`);
            return res.sendFile(resolvedPath, function (err) {
                if (err) {
                    logger.error('Error sending file', err);
                    res.status(err.status).end();
                } else {
                    logger.info('Successfully sent public keys for ${csrFileName}', resolvedPath);
                }
            });
        } catch (ex) {
            logger.error(`Error executing sigining script for ${csrFileName}`, ex);
            return res.status(500).send("Internal Server Error");
        }
    } catch (ex) {
        logger.error(`Exception while signing CSR: `, ex);
        return res.status(500).send("Internal Server Error");
    }
})


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(log4js.connectLogger(httpLogger, {
    level: 'info',
    format: (req, res, format) => format(':remote-addr - ":method :url HTTP/:http-version" :status :content-length ":referrer" ":user-agent"'),
}));
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
