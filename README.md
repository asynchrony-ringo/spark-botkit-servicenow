This project is aimed at bridging Spark and Service now via Spark bot technology.

## Deploy to Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/asynchrony-ringo/spark-botkit-servicenow/)

## Getting Started

#### Create a Development ServiceNow User to Authenticate Your Bot
 1. Login to your ServiceNow instance.
 1. Using the "Filter Navigator" search bar, search for "Users"
 1. Click on the "Users" link under "User Administration"
 1. Click on the "New" button in the top navigation bar
 1. Create a user and specify a `User ID` and `Password`


#### Create the Bot

 - [Create a bot in the Spark for Developers site](https://developer.ciscospark.com/add-bot.html). You'll receive an `access token`.
    - Save this access token securely for future use: it will be required in order to run the bot

#### Setup Your Project's Environment Variables
 - Create a `.env` environment variables file in the root directory of the project.
    - This file will contain all your local environment variables that get loaded by the project.
 - Populate your `.env` file with the following variables:

    ```
    access_token=[bot_access_token_from_spark]
    base_url=[serviceNow_instance_base_url]
    servicenow_username=[serviceNow_user_created_above]
    servicenow_password=[serviceNow_users_password_created_above]
    ```

#### Setup a Public Address Through ngrok

To actually get the bot up and running, a public address is required. We used ngrok in order to create a public address that can be utilized.

 - Install ngrok globally via npm: `npm install -g ngrok`
 - Create a public address on port 3000: `ngrok http 3000`
 - ngrok should create a session with a unique `http` and `https` forwarding address (something like: `https://bb94ea5d.ngrok.io`)
 - Add the `https` forwarding address to your `.env` file as follows:

    ```
    public_address=[ngrok_https_forwarding_address]
    ```

### Build and Run

 - Install necessary node packages: `npm install`
 - Build the docker image for the project: `docker build -t cisco/servicenow-spark-bot .`
 - Spin up the docker container: `./start.dev.sh`
    - NOTE: To spin up the docker container in production, run: `start.sh`


You should now be able to communicate with the bot from within Cisco Spark.

---

## Bot Commands - How to Talk With Your Bot

- You can ask your bot for help (`@BotName help`) to display the available commands within Spark:

###Create
* Create an Incident, Problem, or Change Request:
    * `incident create [short description] [category]`
        * **short description:** sentence describing the incident
        * **category:** Inquiry / Help, Software, Hardware, Network, or Database
    * `problem create [short description]`
        * **short description:** sentence describing the problem
    * `cr create [short description] [category]`
        * **short description:** sentence describing the change request
        * **category:** Hardware, Software, Business Service, System Software, Applications Software, Network, Telecom, Documentation, Other, or Cloud Management

###View
* View the status of an Incident, Problem, or Change Request by internal ID:
    * `incident status sys_id`
    * `problem status sys_id`
    * `cr status sys_id`
* View the Incidents, Problems, or Change Requests that are assigned to you:
    * `incident assigned`
    * `problem assigned`
    * `cr assigned`

###Update
* List all properties available to update on an Incident, Problem, or Change Request:
    * `incident update sys_id guide`
    * `problem update sys_id guide`
    * `cr update sys_id guide`
* Update a property on an Incident, Problem, or Change Request:
    * `incident update sys_id field=[value]` or
    * `incident update sys_id field=[value] field2=[value2]` for multiple fields
        * **field**: the field name you want to update
        * **value:** the value you want to set on the updated field
    * `problem update sys_id field=[value]`
        * **field**: the field name you want to update
        * **value:** the value you want to set on the updated field
    * `cr update sys_id field=[value]`
        * **field**: the field name you want to update
        * **value:** the value you want to set on the updated field
* Assign yourself to an Incident, Problem, or Change Request:
    * `incident assign sys_id`
    * `problem assign sys_id`
    * `cr assign sys_id`
* Add yourself to the watchlist of an Incident, Problem, or Change Request:
    * `incident watch sys_id`
    * `problem watch sys_id`
    * `cr watch sys_id`
* Remove yourself from the watchlist of an Incident, Problem, or Change Request:
    * `incident remove watch sys_id`
    * `problem remove watch sys_id`
    * `cr remove watch sys_id`

---

## Alerting
To enable your bot to receive update alerts from ServiceNow you must add a Business Rule.

1. Login to your ServiceNow instance.
1. Using the "Filter Navigator" search bar, search for "Business Rules"
1. Click on the "Business Rules" link under "System Definition"
2. Click on the "New" button in the top navigation bar
3. Enter a unique name that you can use to find your Business Rule in the future
4. Select the table you wish to receive alerts about from the "Table" dropdown
1. Check the "Advanced" checkbox
1. In the "When to run" tab:
    1. Set the "When" dropdown to "after"
    2. Select the appropriate actions from the available action checkboxes (insert, update, delete, query) you want to run the trigger on
3. In the "Advanced" tab:
    4. Enter the code that will make a request whenever a change is triggered:
        1. [See our examples for writing Business Rules](https://gitlab.asynchrony.com/proj-1274/spark-botkit-servicenow/tree/master/docs)
        2. Note: You will have to update the call to `setEndpoint` in order to pass in the public address of your bot
1. Submit the Business Rule

---

## Creating new skills

In order to create additional functionality for the bot, you will have to create a new skill that listens to a particular message and acts accordingly. The existing skills can be found in the `src/skills` directory. The project is set up in a way that any skills located within this directory will be registered with the Spark bot.

Within a newly created skill, you will need to call `.hears` and provide a regex pattern that will match a certain message the user sends to the bot in Spark, as well as a callback that will fire when the message is received. The callback takes both the bot and the message.

In order to have the bot send a message to the user, you can use the bot's `.reply(message, "custom message")` function, which takes the original message and your bot's response.

To communicate with ServiceNow, you can use the `service_now_client.js` in order to make calls to the
[Table API](https://docs.servicenow.com/bundle/istanbul-servicenow-platform/page/integrate/inbound-rest/concept/c_TableAPI.html). Using
this class, you can retrieve, create, and update records within tables in ServiceNow.
