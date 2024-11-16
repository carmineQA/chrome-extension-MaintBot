let config = null;

// Load the configuration at the start
// The config.json file contains the necessary settings such as organization name, project name, PAT, PBI ID, and Sprint Path.
fetch(chrome.runtime.getURL('config.json'))
    .then(response => response.json())
    .then(data => {
        config = data;
    })
    .catch(error => {
        console.error('Error loading config:', error);
    });

// Listen for messages sent from other parts of the extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Received request:', request);

    if (request.action === 'createTask') {
        if (!config) {
            sendResponse({ message: 'Configuration not loaded yet.' });
            return;
        }

        // Trim whitespace from the title and description (if present)
        const testTitle = request.title.trim();  // Remove any leading or trailing spaces from the title
        const description = request.description ? request.description.trim() : '';  // Get the description and remove any extra spaces
        console.log('Test title:', testTitle);
        console.log('Description:', description);

        // Function to create a new task under the specified PBI
        function createTask(pbiId) {
            // Define the API endpoint for creating a task under the project backlog in Azure DevOps
            const apiUrl = `https://dev.azure.com/${config.organization}/${config.projectName}/_apis/wit/workitems/$Task?api-version=7.1`;

            console.log('Create task API URL:', apiUrl);

            // Construct the data for the POST request
            const data = JSON.stringify([{
                "op": "add",  // The operation type, "add" means we are adding fields to the new task
                "path": "/fields/System.Title",
                "value": testTitle  // The task's title
            },
            {
                "op": "add",  // Add the description to the task
                "path": "/fields/System.Description",
                "value": description
            },
            {
                "op": "add",  // Set the Iteration Path (Sprint) for the task
                "path": "/fields/System.IterationPath",
                "value": config.sprintPath  // The Sprint Path, defined in the config file
            },
            {
                "op": "add",  // Create a link to the parent PBI for the task
                "path": "/relations/-",
                "value": {
                    "rel": "System.LinkTypes.Hierarchy-Reverse",  // This establishes a parent-child link (Task under PBI)
                    "url": `https://dev.azure.com/${config.organization}/${config.projectName}/_apis/wit/workItems/${pbiId}`  // URL to the parent PBI
                }
            }]);

            console.log('Data for task creation:', data);

            // Use fetch to make a POST request to create the task
            fetch(apiUrl, {
                method: 'POST',  // Use POST to create a new task
                headers: {
                    'Content-Type': 'application/json-patch+json',  // Content type is JSON, specifically for Azure DevOps API
                    // Authentication header using Basic authentication. The PAT is base64-encoded with btoa().
                    'Authorization': 'Basic ' + btoa(':' + config.personalAccessToken)  // Use the PAT for authentication
                },
                body: data,  // Attach the data as the body of the request
            })
            .then(response => {
                console.log('Response status:', response.status);  // Log the status of the response from the API

                // If the response is not OK, read the response body for more details
                if (!response.ok) {
                    console.error('Error creating task: ', response.statusText);

                    // Read the response body as text to understand the error
                    return response.text().then(errorText => {
                        console.error('Error response body:', errorText);
                        sendResponse({ message: 'Error creating task: ' + errorText });
                    });
                }

                // If the response is OK, parse the JSON response and log the details of the new task
                return response.json();
            })
            .then(json => {
                console.log('Task created successfully:', json);
                sendResponse({ message: 'Task created successfully!' });
            })
            .catch(error => {
                console.error('Error creating task:', error);
                sendResponse({ message: 'Error creating task: ' + error.message });
            });
        }

        // Create the task under the specified PBI by calling createTask and passing the PBI ID
        createTask(config.pbiId);

        return true;  // Indicates that the response is asynchronous (we'll respond once the task is created)
    }
});
