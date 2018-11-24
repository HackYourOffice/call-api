'use strict';

const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();
const table = "call_subscriptions";

exports.lambdaHandler = async (event, context) => {
    console.log('event', event);

    var body = {
        'Message': 'OK',
    }
    var statusCode = 200;

    try {
        var data = JSON.parse(event.body);
        if (data == undefined || !('EventId' in data)) {
            throw new Error('Required field UserId or EventId is missing');
        }
        try {
            const searchParams = {
                TableName: table,
                FilterExpression: "#EventId = :EventId",
                ExpressionAttributeNames: {
                    "#EventId": "EventId",
                },
                ExpressionAttributeValues: {
                     ":EventId": data.EventId,
                }
            }
            const queryData = await docClient.scan(searchParams).promise();

            body.TotalSubscribers = queryData.Items.length;
            body.TotalAccepted = 0;
            for (var i = 0; i < queryData.Items.length; i++) {
                var item = queryData.Items[i];
                if (('Accepted' in item) && (item.Accepted > 0)) {
                    body.TotalAccepted += 1;
                }
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
