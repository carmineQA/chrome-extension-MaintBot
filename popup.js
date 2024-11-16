document.addEventListener('DOMContentLoaded', function() {
    // Get references to all the DOM elements used in the popup
    const titleInput = document.getElementById('title');  // Input field for the task title
    const createTaskButton = document.getElementById('createTask');  // Button to create a maintenance task
    const closePopupButton = document.getElementById('closePopup');  // Button to close the popup
    const extractTitleButton = document.getElementById('extractTitle');  // Button to extract the test case title
    const descriptionTextarea = document.getElementById('description');  // Textarea for the task description

    // Function to enable or disable the "Create a Maintenance Task" button
    function updateCreateTaskButtonState() {
        // Check if the "Extract Title" button has been enabled
        const isEnabled = extractTitleButton.classList.contains('enabled');

        if (isEnabled) {
            // If the "Extract Title" button is enabled, enable the "Create Task" button
            createTaskButton.classList.add('enabled');
            createTaskButton.disabled = false;
        } else {
            // If not, disable the "Create Task" button
            createTaskButton.classList.remove('enabled');
            createTaskButton.disabled = true;
        }
    }

    // Initialize the "Create Task" button as disabled when the page is loaded
    createTaskButton.classList.remove('enabled');
    createTaskButton.disabled = true;

    // Function to handle the task creation process when the "Create a Maintenance Task" button is clicked
    createTaskButton.addEventListener('click', function() {
        console.log('Create Task button clicked.');

        // Get the values entered in the title and description fields
        const title = titleInput.value.trim();
        const description = descriptionTextarea.value.trim();

        // If the title is empty, prevent the task creation
        if (!title) {
            console.log('Title is empty.');
            return;
        }

        // Send a message to the background script to create a task with the entered title and description
        chrome.runtime.sendMessage({ action: 'createTask', title: title, description: description }, function(response) {
            console.log('Response after task creation:', response);

            // Get the result div to display success or error messages
            const resultDiv = document.getElementById('result');
            if (response) {
                // Display success or error message depending on the response
                resultDiv.textContent = response.message;
                resultDiv.style.color = response.message.includes('Error') ? '#E74C3C' : '#2ECC71';
                resultDiv.style.display = 'block';
            } else {
                // If no response was received from the background script, show an error message
                resultDiv.textContent = 'Error: No response from background script.';
                resultDiv.style.color = '#E74C3C';
                resultDiv.style.display = 'block';
            }
        });
    });

    // Event listener to close the popup when the close button is clicked
    closePopupButton.addEventListener('click', function() {
        window.close();
    });

    // Prevent the popup from closing when clicking inside it, avoiding unwanted interactions
    document.body.addEventListener('mousedown', function(event) {
        event.stopPropagation();
    });

    // Event listener for the "Extract Title" button click
    extractTitleButton.addEventListener('click', function() {
        console.log('Extract Title button clicked.');
    
        // Query the active tab in the current window
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const activeTab = tabs[0];  // Get the active tab in the browser
    
            // Execute a script in the active tab to extract the relevant data
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                func: function() {
                    // Find the element on the page that contains the test case title
                    const element = document.querySelector('.ScenarioEditorHeaderLeftSide_leftSide_DBCsw_VmdFNpZGUt .clickableText_clickableText_Z_8SV_JsZVRleHQt');
                    if (element) {
                        // If the element is found, return the title and current URL
                        return {
                            title: element.getAttribute('title') || '',  // Extract title attribute or an empty string
                            url: window.location.href,  // Get the current page URL
                            errorMessage: "Temporary - Insert actual error here"  // Placeholder for actual error message
                        };
                    }
                    // Return empty data if the element is not found
                    return { title: '', url: window.location.href, errorMessage: '' };
                }
            }, function(results) {
                if (chrome.runtime.lastError) {
                    console.error('Script execution error:', chrome.runtime.lastError);
                    return;
                }
                // Destructure the result from the executed script
                const { title, url, errorMessage } = results[0]?.result || { title: '', url: window.location.href, errorMessage: '' };

                if (title) {
                    // If a title was found, populate the title input field and description textarea
                    titleInput.value = '[Maintenance]' + title;
    
                    // Process the error message (trim, limit length)
                    let errorMsg = errorMessage.trim();
                    if (errorMsg.length > 100) {
                        errorMsg = errorMsg.substring(0, 100) + '...';  // Trim the error message to 100 characters
                    }
    
                    // Set the description with the error message and URL
                    descriptionTextarea.value = 
                        'STEP FAILED: ' + errorMsg + '\n\n' + // Add error message with a newline
                        'Link: ' + url; // Add the current page URL to the description
    
                    // Enable the "Extract Title" button after extracting the data
                    extractTitleButton.classList.add('enabled'); 
                    // Update the state of the "Create Task" button (enable it if title was extracted)
                    updateCreateTaskButtonState();
                } else {
                    console.error('No title found or element does not exist.');
                }
            });
        });
    });
});
