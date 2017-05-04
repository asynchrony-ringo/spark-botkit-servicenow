This project is aimed at bridging Spark and Service now via Spark box technology. 

## Development Requirements
The bot is spun up within a docker container. Scripts have been written in order to 
run the bot either in production or the dev environment.
 - start-dev.sh
 - start.sh

### Getting Started

 - [Create a bot in the Spark for Developers site](https://developer.ciscospark.com/add-bot.html). You'll receive an `access token`.
    - Save this access token securely for future use: it will be required in order to run the bot
    - Copy & paste the access token as the ```access_token``` variable in the ```.env``` file of the project
 
To actually get the bot up and running, a public address is required. We used ngrok in order to create a public address that can be utilized. 

 - Install ngrok globally via npm (```npm install -g ngrok```). 
 - Create a public address on port 3000 - ```ngrok http 3000```
    - NOTE: the docker instance must be running on port 3000 in order for communication to the bot to work
 - Copy the https forwarding address in the ngrok log (```https://<########>.ngrok.io```)
 - Paste that address as the ```public_address``` variable in the ```.env``` file of the project
 - run `npm install`
 - make sure you have docker installed
 - ` docker build -t asynchronyringo/service-now-spark-bot . `
 - run the start-dev script `./start.dev.sh`


You should now be able to communicate with the bot from within Cisco Spark

### SNBot commands
 
 See the [help sheet](https://gitlab.asynchrony.com/proj-1274/spark-botkit-servicenow/blob/master/docs/help.md) or type '@SNBot help' within Spark for a list of the various SNBot commands


### Alerting
To enable your bot to recieve update alerts from ServiceNow you must add a Business Rule.

1. Using the "Filter Navigator" search bar, search for "Business Rules"
1. Click on the "Business Rules" link under "System Definition"
2. Click on the "New" button in the top navigation bar
3. Enter a unique name that you can use to find your Business Rule in the future
4. Select the table you wish to recieve alerts about from the "Table" dropdown
1. Check the "Advanced" checkbox
1. In the "When to run" tab:
    1. Set the "When" dropdown to "after"
    2. Select the appropriate actions from the available action checkboxes (insert, update, delete, query) you want to run the trigger on
3. In the "Advanced" tab:
    4. Enter the code that will fire when a change is triggered
        1. [See our examples for writing Business Rules](https://gitlab.asynchrony.com/proj-1274/spark-botkit-servicenow/tree/master/docs)
        2. Note: You will have to update the call to ```setEndpoint``` in order to pass in the public address of your bot
    

