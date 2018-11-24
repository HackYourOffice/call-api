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
        if (data == undefined || !('EventId' in data) || !('UserId' in data)) {
            throw new Error('Required field EventId or UserId is missing');
        }

        try {
            const searchParams = {
                TableName: table,
                FilterExpression: "#EventId = :EventId AND #UserId = :UserId",
                ExpressionAttributeNames: {
                    "#EventId": "EventId",
                    "#UserId": "UserId"
                },
                ExpressionAttributeValues: {
                     ":EventId": data.EventId,
                     ":UserId": data.UserId
                }
            }

            const queryData = await docClient.scan(searchParams).promise();
            body.Count = queryData.Items.length;
            for (var i = 0; i < queryData.Items.length; i++) {
                var item = queryData.Items[i];
                const updateParams = {
                    TableName : table,
                    Key: {
                        "SubscriptionId": item.SubscriptionId
                    },
                    UpdateExpression: "set Accepted = :a",
                    ExpressionAttributeValues: {
                        ":a": 1
                    }
                };

                await docClient.update(updateParams).promise();
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
