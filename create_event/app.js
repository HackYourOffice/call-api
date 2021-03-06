'use strict';

const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();
const table = "call_events";

exports.lambdaHandler = async (event, context) => {
    console.log('event', event);

    var body = {
        'Message': 'created user',
    }
    var statusCode = 200;

    try {
        var data = JSON.parse(event.body);
        if (data == undefined || !('Title' in data) || !('UserId' in data)) {
            throw new Error('Required field UserId or Title is missing');
        }

        try {
            const eventid = uuidv4();
            var item = {
                "EventId": eventid,
                "Title": data.Title,
                "UserId": data.UserId
            };

            if ('Description' in data) {
                item.Description = data.Description;
            }

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
