'use strict';

const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();
const table = "call_events";

exports.lambdaHandler = async (event, context) => {
    console.log('event', event);

    var body = {
        'message': 'created user',
    }
    var statusCode = 200;

    try {
        var data = JSON.parse(event.body);
        if (!('title' in data) || !('userid' in data)) {
            throw new Error('Required field userid or title is missing');
        }

        try {
            const eventid = uuidv4();
            body.eventid = eventid;

            var item = {
                "title": data.title,
                "userid": data.userid,
                    "eventid": eventid
            };

            if ('description' in data) {
                item.description = data.description;
            }

            var params = {
                TableName: table,
                Item: item
            };

            await docClient.put(params).promise();
        } catch (err) {
            console.log(err);
            statusCode = 500;
            body.message = err.toString();
        }
    } catch (err) {
        statusCode = 400;
        body.message = err.toString();
    }

    return {
        'statusCode': statusCode,
        'body': JSON.stringify(body)
    }
};
