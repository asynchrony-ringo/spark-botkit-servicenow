(function executeRule(current, previous /*null when async*/) {
	function getProblemObject(problem) {
		return {
			type: 'Problem',
			alert_email: problem.opened_by.email.getDisplayValue(),
			parent: problem.parent.getDisplayValue(),
			made_sla: problem.made_sla.getDisplayValue(),
			watch_list: problem.watch_list.getDisplayValue(),
			upon_reject: problem.upon_reject.getDisplayValue(),
			sys_updated_on: problem.sys_updated_on.getDisplayValue(),
			approval_history: problem.approval_history.getDisplayValue(),
			skills: problem.skills.getDisplayValue(),
			number: problem.number.getDisplayValue(),
			sys_updated_by: problem.sys_updated_by.getDisplayValue(),
			work_around: problem.work_around.getDisplayValue(),
			opened_by: problem.opened_by.getDisplayValue(),
			user_input: problem.user_input.getDisplayValue(),
			sys_created_on: problem.sys_created_on.getDisplayValue(),
			state: problem.state.getDisplayValue(),
			sys_created_by: problem.sys_created_by.getDisplayValue(),
			knowledge: problem.knowledge.getDisplayValue(),
			order: problem.order.getDisplayValue(),
			closed_at: problem.closed_at.getDisplayValue(),
			cmdb_ci: problem.cmdb_ci.getDisplayValue(),
			delivery_plan: problem.delivery_plan.getDisplayValue(),
			impact: problem.impact.getDisplayValue(),
			active: problem.active.getDisplayValue(),
			work_notes_list: problem.work_notes_list.getDisplayValue(),
			business_service: problem.business_service.getDisplayValue(),
			priority: problem.priority.getDisplayValue(),
			sys_domain_path: problem.sys_domain_path.getDisplayValue(),
			rfc: problem.rfc.getDisplayValue(),
			time_worked: problem.time_worked.getDisplayValue(),
			expected_start: problem.expected_start.getDisplayValue(),
			opened_at: problem.opened_at.getDisplayValue(),
			business_duration: problem.business_duration.getDisplayValue(),
			group_list: problem.group_list.getDisplayValue(),
			work_end: problem.work_end.getDisplayValue(),
			approval_set: problem.approval_set.getDisplayValue(),
			work_notes: problem.work_notes.getDisplayValue(),
			short_description: problem.short_description.getDisplayValue(),
			correlation_display: problem.correlation_display.getDisplayValue(),
			delivery_task: problem.delivery_task.getDisplayValue(),
			work_start: problem.work_start.getDisplayValue(),
			assignment_group: problem.assignment_group.getDisplayValue(),
			known_error: problem.known_error.getDisplayValue(),
			additional_assignee_list: problem.additional_assignee_list.getDisplayValue(),
			description: problem.description.getDisplayValue(),
			calendar_duration: problem.calendar_duration.getDisplayValue(),
			close_notes: problem.close_notes.getDisplayValue(),
			sys_class_name: problem.sys_class_name.getDisplayValue(),
			closed_by: problem.closed_by.getDisplayValue(),
			follow_up: problem.follow_up.getDisplayValue(),
			sys_id: problem.sys_id.getDisplayValue(),
			contact_type: problem.contact_type.getDisplayValue(),
			urgency: problem.urgency.getDisplayValue(),
			company: problem.company.getDisplayValue(),
			reassignment_count: problem.reassignment_count.getDisplayValue(),
			related_incidents: problem.related_incidents.getDisplayValue(),
			activity_due: problem.activity_due.getDisplayValue(),
			assigned_to: problem.assigned_to.getDisplayValue(),
			comments: problem.comments.getDisplayValue(),
			approval: problem.approval.getDisplayValue(),
			sla_due: problem.sla_due.getDisplayValue(),
			comments_and_work_notes: problem.comments_and_work_notes.getDisplayValue(),
			due_date: problem.due_date.getDisplayValue(),
			problem_state: problem.problem_state.getDisplayValue(),
			sys_mod_count: problem.sys_mod_count.getDisplayValue(),
			sys_tags: problem.sys_tags.getDisplayValue(),
			escalation: problem.escalation.getDisplayValue(),
			upon_approval: problem.upon_approval.getDisplayValue(),
			correlation_id: problem.correlation_id.getDisplayValue(),
			location: problem.location.getDisplayValue()
		};
	}

	var restMessage = new sn_ws.RESTMessageV2();
	restMessage.setHttpMethod("post");
	restMessage.setEndpoint("https://c33e4b47.ngrok.io/servicenow/update");
	restMessage.setRequestHeader('Content-Type', 'application/json');
	var body = {
		'new': getProblemObject(current),
		'old': getProblemObject(previous)
	};
	restMessage.setRequestBody(JSON.stringify(body));

	restMessage.execute();

})(current, previous);
