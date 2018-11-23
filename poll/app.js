'use strict';

const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();
const table_subscriptions = "call_subscriptions";
const table_events = "call_events";

exports.lambdaHandler = async (event, context) => {
    console.log('event', event);

    var body = {
        'Message': 'poll successfull',
    }
    var statusCode = 200;

    try {
        var data = JSON.parse(event.body);
        if (data == undefined || !('UserId' in data)) {
            throw new Error('Required field UserId is missing');
        }

        try {
            const searchParams = {
                TableName: table_subscriptions,
                FilterExpression: "#UserId = :UserId",
                ExpressionAttributeNames: {
                    "#UserId": "UserId",
                },
                ExpressionAttributeValues: {
                     ":UserId": data.UserId,
                }
            }

            const queryData = await docClient.scan(searchParams).promise();
            body.Events = [];
            for (var i = 0; i < queryData.Items.length; i++) {
                const item = queryData.Items[i];
                if (('ActionCode' in item) && (item.ActionCode > 0)) {
                    const queryEventParams = {
                        TableName : table_events,
                        KeyConditionExpression: "#EventId = :EventId",
                        ExpressionAttributeNames: {
                            "#EventId": "EventId"
                        },
                        ExpressionAttributeValues: {
                            ":EventId": item.EventId
                        }
                    };

                    const eventData = await docClient.query(queryEventParams).promise();
                    for (var j = 0; j < eventData.Items.length; j++) {
                        var eventItem = eventData.Items[j];
                        body.Events.push({
                            "ActionCode": item.ActionCode,
                            "EventId": item.EventId,
                            "Title": eventItem.Title,
                            "Description": eventItem.Description
                        })
                    }

                    const updateParams = {
                        TableName : table_subscriptions,
                        Key: {
                            "SubscriptionId": item.SubscriptionId
                        },
                        UpdateExpression: "set ActionCode = :a",
                        ExpressionAttributeValues: {
                            ":a": 0
                        }
                    };

                    await docClient.update(updateParams).promise();
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
