* Check the status of an Incident, Problem, or Change Request by internal ID:
    * `incident status sys_id`
    * `problem status sys_id`
    * `cr status sys_id`
* Create an Incident, Problem, or Change Request:
    * `incident create <description> <category>`
        * category should be one of: Inquiry / Help, Software, Hardware, Network, Database
    * `problem create <description>`
    * `cr create <description> <category>`
        * category should be one of: Hardware, Software, Business Service, System Software, Applications Software, Network, Telecom, Documentation, Other, Cloud Management
* View the Incidents, Problems, or Change Requests that are assigned to you:
    * `incident assigned`
    * `problem assigned`
    * `cr assigned`
* Add yourself to the watchlist of an Incident, Problem, or Change Request:
    * `incident watch sys_id`
    * `problem watch sys_id`
    * `cr watch sys_id`
* Remove yourself from the watchlist of an Incident, Problem, or Change Request:
    * `incident remove watch sys_id`
    * `problem remove watch sys_id`
    * `cr remove watch sys_id`
* Assign yourself to an Incident, Problem, or Change Request:
    * `incident assign sys_id`
    * `problem assign sys_id`
    * `cr assign sys_id`
