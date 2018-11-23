'use strict';

const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();
const table = "call_subscriptions";

exports.lambdaHandler = async (event, context) => {
    console.log('event', event);

    var body = {
        'Message': 'subscribed to event',
    }
    var statusCode = 200;

    try {
        var data = JSON.parse(event.body);
        if (data == undefined || !('EventId' in data) || !('UserId' in data)) {
            throw new Error('Required field UserId or EventId is missing');
        }

        try {
            const subscriptionid = uuidv4();
            var item = {
                "SubscriptionId": subscriptionid,
                "UserId": data.UserId,
                "EventId": data.EventId
            };

            var params = {
                TableName: table,
                Item: item
            };

            await docClient.put(params).promise();
            body.Subscription = item
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
