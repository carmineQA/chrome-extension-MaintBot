# Testim to Azure DevOps Task Creator

## Description
This Chrome extension simplifies the process of creating maintenance tasks in **Azure DevOps** during failure analysis of test cases (TCs).
When a test fails in **Testim**, the extension allows you to automatically capture relevant data (such as the title, main error, and an optional description) and create a maintenance task directly in **Azure DevOps**.
This eliminates the need to manually copy data between **Testim** and **Azure DevOps**, saving time and improving workflow efficiency.
The task will be created in the current sprint (which you can configure manually in the code), helping teams keep their maintenance tasks organized and linked to the correct iteration.

## Installation
1. **Download or clone** this repository.
2. Go to `chrome://extensions/` in your Chrome browser.
3. **Enable Developer mode** (toggle in the top right).
4. Click on **Load unpacked** and select the folder where the extension is located.

## Features
- **Automatic data capture** from Testim: Collects title, main error, and an optional description from failed test cases.
- **One-click task creation** in Azure DevOps: Creates maintenance tasks without the need for manual data entry.
- **Sprint assignment**: Automatically assigns tasks to the ongoing sprint (configurable within the code).
- **Saves time** by automating the manual task of copying data between Testim and Azure DevOps.
- **Customizable description**: Add additional notes or details to the task directly from the extension popup.

## Usage
1. Open the extension by clicking the extension icon in your Chrome toolbar.
2. Review or add a description in the popup window (optional).
3. Click the **Create Task** button.
4. The extension will capture the relevant data from the current failed test case in Testim and create a maintenance task in **Azure DevOps**.

## Contributing
If you have suggestions, improvements, or bug fixes, feel free to open an issue or submit a pull request. Contributions are welcome!

## Acknowledgements
- This project utilizes **Azure DevOps API** for task creation.
- **Testim UI**  is used to capture the test case data.
