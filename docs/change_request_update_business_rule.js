(function executeRule(current, previous /*null when async*/) {
	function getCRObject(cr) {
		return {
			type: 'Change Request',
			alert_email: cr.requested_by.email.getDisplayValue(),
			parent: cr.parent.getDisplayValue(),
			made_sla: cr.made_sla.getDisplayValue(),
			watch_list: cr.watch_list.getDisplayValue(),
			upon_reject: cr.upon_reject.getDisplayValue(),
			sys_updated_on: cr.sys_updated_on.getDisplayValue(),
			approval_history: cr.approval_history.getDisplayValue(),
			skills: cr.skills.getDisplayValue(),
			number: cr.number.getDisplayValue(),
			sys_updated_by: cr.sys_updated_by.getDisplayValue(),
			work_around: cr.work_around.getDisplayValue(),
			opened_by: cr.opened_by.getDisplayValue(),
			requested_by: cr.requested_by.getDisplayValue(),
			user_input: cr.user_input.getDisplayValue(),
			state: cr.state.getDisplayValue(),
			sys_created_by: cr.sys_created_by.getDisplayValue(),
			knowledge: cr.knowledge.getDisplayValue(),
			order: cr.order.getDisplayValue(),
			closed_at: cr.closed_at.getDisplayValue(),
			cmdb_ci: cr.cmdb_ci.getDisplayValue(),
			delivery_plan: cr.delivery_plan.getDisplayValue(),
			impact: cr.impact.getDisplayValue(),
			active: cr.active.getDisplayValue(),
			work_notes_list: cr.work_notes_list.getDisplayValue(),
			business_service: cr.business_service.getDisplayValue(),
			priority: cr.priority.getDisplayValue(),
			sys_domain_path: cr.sys_domain_path.getDisplayValue(),
			rfc: cr.rfc.getDisplayValue(),
			time_worked: cr.time_worked.getDisplayValue(),
			expected_start: cr.expected_start.getDisplayValue(),
			opened_at: cr.opened_at.getDisplayValue(),
			business_duration: cr.business_duration.getDisplayValue(),
			group_list: cr.group_list.getDisplayValue(),
			work_end: cr.work_end.getDisplayValue(),
			approval_set: cr.approval_set.getDisplayValue(),
			work_notes: cr.work_notes.getDisplayValue(),
			short_description: cr.short_description.getDisplayValue(),
			correlation_display: cr.correlation_display.getDisplayValue(),
			delivery_task: cr.delivery_task.getDisplayValue(),
			work_start: cr.work_start.getDisplayValue(),
			assignment_group: cr.assignment_group.getDisplayValue(),
			known_error: cr.known_error.getDisplayValue(),
			additional_assignee_list: cr.additional_assignee_list.getDisplayValue(),
			description: cr.description.getDisplayValue(),
			calendar_duration: cr.calendar_duration.getDisplayValue(),
			close_notes: cr.close_notes.getDisplayValue(),
			sys_class_name: cr.sys_class_name.getDisplayValue(),
			closed_by: cr.closed_by.getDisplayValue(),
			follow_up: cr.follow_up.getDisplayValue(),
			sys_id: cr.sys_id.getDisplayValue(),
			contact_type: cr.contact_type.getDisplayValue(),
			urgency: cr.urgency.getDisplayValue(),
			company: cr.company.getDisplayValue(),
			reassignment_count: cr.reassignment_count.getDisplayValue(),
			related_incidents: cr.related_incidents.getDisplayValue(),
			comments: cr.comments.getDisplayValue(),
			approval: cr.approval.getDisplayValue(),
			sla_due: cr.sla_due.getDisplayValue(),
			comments_and_work_notes: cr.comments_and_work_notes.getDisplayValue(),
			due_date: cr.due_date.getDisplayValue(),
			problem_state: cr.problem_state.getDisplayValue(),
			sys_mod_count: cr.sys_mod_count.getDisplayValue(),
			sys_tags: cr.sys_tags.getDisplayValue(),
			escalation: cr.escalation.getDisplayValue(),
			upon_approval: cr.upon_approval.getDisplayValue(),
			correlation_id: cr.correlation_id.getDisplayValue(),
			location: cr.location.getDisplayValue(),
			assigned_to: cr.assigned_to.getDisplayValue()
		};
	}

	var restMessage = new sn_ws.RESTMessageV2();
	restMessage.setHttpMethod("post");
	restMessage.setEndpoint("https://c33e4b47.ngrok.io/servicenow/update");
	restMessage.setRequestHeader('Content-Type', 'application/json');
	var body = {
		'new': getCRObject(current),
		'old': getCRObject(previous)
	};
	restMessage.setRequestBody(JSON.stringify(body));

	restMessage.execute();
})(current, previous);
