function allowDrop(event) {
    event.preventDefault();  // Allow the drop by preventing the default action
}

// Drag event to store subtask and sprint information
// Drag event to store subtask and sprint information
function drag(event) {
    const subtaskId = event.target.id;  // Get the subtask ID from the dragged element
    const sprintId = event.target.closest('.sprint-box') ? event.target.closest('.sprint-box').id : 'backlog'; // Get sprintId of where the subtask is coming from

    // Store both the subtask ID and the sprint ID (source sprint ID)
    event.dataTransfer.setData("subtaskId", subtaskId);
    event.dataTransfer.setData("sprintId", sprintId);
}


// Drop event to handle moving subtasks
// Drop event to handle moving subtasks
// Drop event to handle moving subtasks
function drop(event) {
    event.preventDefault();  // Prevent the default drop action

    const subtaskId = event.dataTransfer.getData("subtaskId"); // Get subtaskId from the dataTransfer
    const sprintId = event.dataTransfer.getData("sprintId");  // Get sprintId from the dataTransfer

    const subtaskIdParts = subtaskId.split('-');
    const subtaskIdValue = subtaskIdParts[1];  // Extract subtaskId value (remove "subtask-")

    const sprintIdParts = sprintId.split('-');
    const sprintIdValue = sprintIdParts[1];    // Extract sprintId value (remove "sprint-")

    // If the subtask is dropped in the backlog (handle as a special case)
    if (event.target.closest('#backlog')) {
        // Redirect to the "move back to backlog" URL
        window.location.replace(`/task/personal/remove-subTask-from-sprint/${userId}/${taskId}/${sprintIdValue}/${subtaskIdValue}`);
    } else {
        // If subtask is dropped into a sprint, move it to that sprint
        const targetSprintId = event.target.closest('.sprint-box').id.split('-')[1];  // Get the target sprint's ID

        // Check if subtask is already in the target sprint
        const existingSubtask = event.target.closest('.sprint-box').querySelector(`#subtask-${subtaskIdValue}`);
        
        if (existingSubtask) {
            alert("This subtask is already in this sprint.");
            return;
        }

        // If the subtask is coming from the backlog, call the add-to-sprint route
        if (sprintId === 'backlog') {
            // Redirect to add the subtask to the sprint
            window.location.replace(`/task/personal/add-subTask-to-sprint/${userId}/${taskId}/${targetSprintId}/${subtaskIdValue}`);
        } else {
            // Get the previous sprint id from the current location of the subtask (where it was before)
            const prevSprintId = sprintId.split('-')[1];  // This will get the correct previous sprint ID from the dragged subtask

            // Redirect to move subtask to the target sprint
            window.location.replace(`/task/personal/change-subTask-sprint/${userId}/${taskId}/${prevSprintId}/${targetSprintId}/${subtaskIdValue}`);
        }
    }
}

function openSubtaskModal(id, name, weeks, days, hours, sprintId) {
    document.getElementById("modalSubtaskName").innerText = name;
    document.getElementById("modalSubtaskBurnTime").innerText = `${weeks}W ${days}D ${hours}H`;
    document.getElementById("deleteSubtaskForm").action = `/task/personal/sprint/subTask-delete/${userId}/${taskId}/${sprintId}/${id}`;
    
    // Store subtask info for editing
    document.getElementById("editSubtaskName").value = name;
    document.getElementById("editSubtaskForm").action = `/task/personal/sprint/subTask-change/${userId}/${taskId}/${sprintId}/${id}`;
    
    new bootstrap.Modal(document.getElementById("subtaskViewModal")).show();
}

function openEditSubtaskModal() {
    new bootstrap.Modal(document.getElementById("editSubtaskModal")).show();
}

function openEditSprintModal(sprintId, name, dueDate) {
    // Fill the form with sprint details
    document.getElementById("editSprintName").value = name;
    document.getElementById("editSprintDueDate").value = dueDate;

    // Set the form action dynamically
    document.getElementById("editSprintForm").action = `/task/personal/edit-sprint/${userId}/${taskId}/${sprintId}`;
    document.getElementById("deleteSprintForm").action = `/task/personal/delete-sprint/${userId}/${taskId}/${sprintId}`;

    // Show the modal
    let modal = new bootstrap.Modal(document.getElementById("editSprintModal"));
    modal.show();
}
