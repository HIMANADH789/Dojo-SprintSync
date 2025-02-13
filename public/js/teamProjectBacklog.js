// Allow drag and drop functionality
function allowDrop(event) {
    event.preventDefault();  // Allow the drop by preventing the default action
}

// Drag event handler to store subtask and sprint information
function drag(event) {
    const subtaskId = event.target.id;  // Get the subtask ID from the dragged element
    const sprintId = event.target.closest('.sprint-box') ? event.target.closest('.sprint-box').id : 'backlog'; // Get sprintId of where the subtask is coming from

    // Store both the subtask ID and the sprint ID (source sprint ID)
    event.dataTransfer.setData("subtaskId", subtaskId);
    event.dataTransfer.setData("sprintId", sprintId);
}

// Drop event handler to move subtasks
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
        window.location.replace(`/task/team/project/remove-subTask-from-sprint/${teamId}/${projectId}/${sprintIdValue}/${subtaskIdValue}`);
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
            window.location.replace(`/task/team/project/add-subTask-to-sprint/${teamId}/${projectId}/${targetSprintId}/${subtaskIdValue}`);
        } else {
            // Get the previous sprint id from the current location of the subtask (where it was before)
            const prevSprintId = sprintId.split('-')[1];  // This will get the correct previous sprint ID from the dragged subtask

            // Redirect to move subtask to the target sprint
            window.location.replace(`/task/team/project/change-subTask-sprint/${teamId}/${projectId}/${prevSprintId}/${targetSprintId}/${subtaskIdValue}`);
        }
    }
}


document.addEventListener("DOMContentLoaded", function () {
    // Select all Edit buttons
    const editButtons = document.querySelectorAll(".edit-sprint-btn");

    editButtons.forEach(button => {
        button.addEventListener("click", function () {
            // Extract sprint data from button attributes
            const projectId= this.getAttribute("data-project-id");
            const teamId= this.getAttribute("data-team-id");
            const sprintId = this.getAttribute("data-sprint-id");
            const sprintName = this.getAttribute("data-sprint-name");
            const sprintWeeks = this.getAttribute("data-sprint-weeks");
            const sprintDays = this.getAttribute("data-sprint-days");
            const sprintHours = this.getAttribute("data-sprint-hours");

            // Set modal form action dynamically
            const modalForm = document.querySelector("#editSprintForm");
            modalForm.action = `/task/team/project/sprint/edit/${teamId}/${projectId}/${sprintId}`;
            const modalDeleteForm= document.querySelector("#modalDeleteForm");
            modalDeleteForm.action=`/task/team/project/sprint/delete-sprint/${teamId}/${projectId}/${sprintId}`;
            // Populate modal input fields
            document.querySelector("#sprint-name").value = sprintName;
            document.querySelector("#sprint-weeks").value = sprintWeeks;
            document.querySelector("#sprint-days").value = sprintDays;
            document.querySelector("#sprint-hours").value = sprintHours;
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    let selectedSubtask = null;
    console.log("JS");

    // Attach click event to all "View" buttons
    document.querySelectorAll(".subtask-view").forEach(button => {
        button.addEventListener("click", function () {
            const subtaskElement = this.closest(".subtask");
            const subTaskId = subtaskElement.id.split("-")[1];
            const sprintBox = subtaskElement.closest(".sprint-box");
            const sprintId = sprintBox ? sprintBox.id.split("-")[1] : null;
            
        
            // Store selected subtask
            const textParts = subtaskElement.textContent.split(" - ");

            selectedSubtask = {
                id: subTaskId,
                sprintId: sprintId,
                name: textParts[0] ? textParts[0].trim() : "Unknown",
                assignedTo: textParts[1] ? textParts[1].trim() : "Not Assigned",
                burnTime: textParts[2] ? textParts[2].trim() : "No Burn Time"
            };
            
            // Populate Subtask View Modal
            document.getElementById("modal-subtask-name").textContent = selectedSubtask.name;
            document.getElementById("modal-subtask-assigned").textContent = selectedSubtask.assignedTo;
            document.getElementById("modal-subtask-burn").textContent = selectedSubtask.burnTime;

            // Show the modal
             new bootstrap.Modal(document.getElementById("subtaskViewModal")).show();
            
            

        });
    });

    // Handle Delete Button Click
    document.getElementById("delete-subtask-btn").addEventListener("click", function () {
        if (!selectedSubtask) return;

        const deleteUrl = `/task/team/project/sprint/delete-subTask/${teamId}/${projectId}/${selectedSubtask.sprintId}/${selectedSubtask.id}`;
        window.location.href = deleteUrl;
    });

    // Handle Edit Button Click
    document.getElementById("edit-subtask-btn").addEventListener("click", function () {
        if (!selectedSubtask) return;

        // Populate Edit Modal
        document.getElementById("edit-subtask-name").value = selectedSubtask.name;
        document.getElementById("edit-assignedTo").value = selectedSubtask.assignedTo;
        document.getElementById("edit-dueDate").value = ""; // Set this dynamically if you store it

        // Update form action dynamically
        document.getElementById("editSubtaskForm").action = `/task/team/project/sprint/changesubtask/${teamId}/${projectId}/${selectedSubtask.sprintId}/${selectedSubtask.id}`;

        // Show the edit modal
        const editSubtaskModal = new bootstrap.Modal(document.getElementById("editSubtaskModal"));
        editSubtaskModal.show();
    });
});


