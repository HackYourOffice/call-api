'use strict';

const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();
const table = "call_nfc";

exports.lambdaHandler = async (event, context) => {
    console.log('event', event);

    var body = {
        'Message': 'registered nfc tag',
    }
    var statusCode = 200;

    try {
        var data = JSON.parse(event.body);
        if (data == undefined || !('NfcId' in data) || !('EventId' in data)) {
            throw new Error('Required field NfcId or EventId is missing');
        }

        try {
            const eventid = uuidv4();
            var item = {
                "EventId": data.EventId,
                "NfcId": data.NfcId
            };

            var params = {
                TableName: table,
                Item: item
            };

            await docClient.put(params).promise();
            body.Event = item
        } catch (err) {
            console.log(err);
            statusCode = 500;
            body.Message = err.toString();
        }
    } catch (err) {
        statusCode = 400;
        body.Message = err.toString();
    }

    return {
        'statusCode': statusCode,
        'body': JSON.stringify(body)
    }
};
