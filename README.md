This project is aimed at bridging Spark and Service now via Spark box technology. 

## Development Requirements
The bot is spun up within a docker container. Scripts have been written in order to 
run the bot either in production or the dev environment.
 - start-dev.sh
 - start.sh

### Getting Started

 - [Create a bot in the Spark for Developers site](https://developer.ciscospark.com/add-bot.html). You'll receive an `access token`.
    - Save this access token in 1pass or somewhere else for future use: it will be required in order to run the bot
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

```
{
    "text": "foo"
}
```


You should now be able to communicate with the bot from within Cisco Spark