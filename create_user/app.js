'use strict';

const uuidv4 = require('uuid/v4');
const crypto = require('crypto');

let response;

exports.lambdaHandler = async (event, context) => {
    try {
        var userid = uuidv4();
        userid += "-" + crypto.randomBytes(16).toString('hex');

        var body = {
            'userid': userid,
            'message': 'created'
        }

        response = {
            'statusCode': 200,
            'body': JSON.stringify(body)
        }

        console.log('created user with userid:' + userid)
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};
