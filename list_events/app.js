'use strict';

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const table = "call_events";

exports.lambdaHandler = async (event, context) => {
    console.log('event', event);

    var body = {
        "Message": "events listed",
    };
    var statusCode = 200;


    var params = {
        TableName : table
    };

    try {
        var data = JSON.parse(event.body);
        if (data != undefined && 'UserId' in data) {
            params.filter = data.UserId;
            params.FilterExpression = "#UserId = :UserId";
            params.ExpressionAttributeNames = {
                "#UserId": "UserId"
            };
            params.ExpressionAttributeValues = {
                 ":UserId": data.UserId
            };
        }

        try {
            const data = await docClient.scan(params).promise();
            body.Events = [];
            for (var i = 0; i < data.Items.length; i++) {
                var item = data.Items[i];
                body.Events.push({
                    "EventId": item.EventId,
                    "Title": item.Title,
                    "Description": item.Description
                });
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
