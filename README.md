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


You should now be able to communicate with the bot from within Cisco Spark

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
    
    **Example Code:**
    ```javascript
(function executeRule(current, previous /*null when async*/) {
	function getIncidentObject(incident) {
		return {
			type: 'Incident',
			id: incident.sys_id.getDisplayValue(),
			callerEmail: incident.caller_id.email.getDisplayValue(),
			callerId: incident.caller_id.sys_id.getDisplayValue(),
			number: incident.number.getDisplayValue(),
			shortDescription: incident.short_description.getDisplayValue(),
			category: incident.category.getDisplayValue(),
			subcategory: incident.subcategory.getDisplayValue(),
			businessService: incident.business_service.getDisplayValue(),
			contactType: incident.contact_type.getDisplayValue(),
			state: incident.state.getDisplayValue(),
			impact: incident.impact.getDisplayValue(),
			urgency: incident.urgency.getDisplayValue(),
			priority: incident.priority.getDisplayValue(),
			assignmentGroup: incident.assignment_group.getDisplayValue(),
			assignedTo: incident.assigned_to.getDisplayValue()
		};
	}

	var restMessage = new sn_ws.RESTMessageV2();
	restMessage.setHttpMethod("post");
	restMessage.setEndpoint("https://47ff7d6f.ngrok.io/servicenow/update");
	restMessage.setRequestHeader('Content-Type', 'application/json');
	var body = {
		'new': getIncidentObject(current),
		'old': getIncidentObject(previous)
	};
	restMessage.setRequestBody(JSON.stringify(body));
	
	restMessage.execute();
})(current, previous);
    ```

