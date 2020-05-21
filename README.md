# This or that

Scalable serverless voting app - built with AWS Amplify, AWS AppSync, and Amazon DynamoDB

## To deploy

You can deploy this app and the back end infrastructure in one of two ways:

1. The Amplify CLI
2. One click deploy button

### Amplify CLI

1. First install and configure the Amplify CLI.

> For a complete walkthrough of how to configure the CLI, see [this video](https://www.youtube.com/watch?v=fWbM5DLh25U)

```sh
$ npm install -g @aws-amplify/cli
$ amplify configure
```

2. Clone the repo, install dependencies

```sh
$ git clone https://github.com/dabit3/this-or-that.git
$ cd this-or-that
$ npm install
```

3. Initialize the app

```sh
$ amplify init

? Enter a name for the environment: dev (or your preferred env name)
? Choose your default editor: (your preferred editor)
? Do you want to use an AWS profile? Yes
? Please choose the profile you want to use: your-profile-name

? Do you want to configure Lambda Triggers for Cognito? No
```

4. Deploy the back end

```sh
$ amplify push --y
```

5. Run the app

```sh
$ npm start
```

### One click deploy

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/dabit3/this-or-that)

## About the app

While the voting API is built with DynamoDB and AppSync, the main functionality really is within a single GraphQL resolver that sends an atomic update to DynamoDB.

This atomic update allows the DynamoDB table to stay consistent regardless of the number of other operations that are happening.

### Upvote resolver

__Request mapping template__

```vtl
{
    "version": "2018-05-29",
    "operation": "UpdateItem",
    "key" : {
      "id" : $util.dynamodb.toDynamoDBJson($context.arguments.id)
    },
    "update": {
      "expression" : "set #upvotes = #upvotes + :updateValue",
      "expressionNames" : {
           "#upvotes" : "upvotes"
       },
       "expressionValues" : {
           ":updateValue" : { "N" : 1 }
       }
    }
}
```

__Response mapping template__

```vtl
$util.quiet($ctx.result.put("clientId", "$context.arguments.clientId"))
$util.toJson($ctx.result)
```

## IAM Authorization

As is the way this is set up, the authorization mode is __IAM__ which means that when sending a request the headers need to be signed by the Amplify GraphQL Client using the Amplify credentials in order for the API to accept the request.

> You can also opt for API Key which is less restrictive and only requires that the `x-api-key` header be sent with each request. To do so, run `amplify update api` and set the default authorization mode to `API key`.

To use IAM authorization, there needs to be one addition to the Cognito Identity pool `UnauthRole`. It needs to have permission to invoke the `upVote` mutation.

> If you choose to use API Key for authorization, this step is not needed.

```
 "arn:aws:appsync:us-east-1:<your_account_id>:apis/<your_app_id>/types/Mutation/fields/upVote",
 ```

 To edit and view this role, open the IAM Console in AWS and search for your app name, then choose the one that is the `unauthRole`.
