'use strict';

const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();
const table = "call_nfc";

exports.lambdaHandler = async (event, context) => {
    console.log('event', event);

    var body = {
        'Message': 'OK',
    }
    var statusCode = 200;

    try {
        const data = JSON.parse(event.body);
        if (data == undefined || !('NfcId' in data)) {
            throw new Error('Required field NfcId is missing');
        }

        try {
            const params = {
                TableName : table,
                KeyConditionExpression: "#NfcId = :NfcId",
                ExpressionAttributeNames: {
                    "#NfcId": "NfcId"
                },
                ExpressionAttributeValues: {
                    ":NfcId": data.NfcId
                }
            };

            const queryData = await docClient.query(params).promise();
            for (var i = 0; i < queryData.Items.length; i++) {
                var item = queryData.Items[i];
                body.Item = item
            }

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
