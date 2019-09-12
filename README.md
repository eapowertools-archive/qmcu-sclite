# Status
[![Project Status: Abandoned – Initial development has started, but there has not yet been a stable, usable release; the project has been abandoned and the author(s) do not intend on continuing development.](https://www.repostatus.org/badges/latest/abandoned.svg)](https://www.repostatus.org/#abandoned)

# qmcu-sclite

## What it does
The Source Control Assistant is an application backup and restore solution for Qlik Sense.  Apps are serialized to json files, which can be easily stored and versioned in popular source control systems like Subversion, TFS, and Github.

![1](https://github.com/eapowertools/QlikSenseQMCUtility/wiki/imgs/sclite1.png)

## How it Works
### Backup
Source Control Assistant (SC-Lite) launches with a list of published applications.  From this interface, apps can be backed up one by one, or all at one time by clicking the button at the bottom of the screen.  When a backup is selected, a window will appear with a check box for downloading a zip file.

![2](https://github.com/eapowertools/QlikSenseQMCUtility/wiki/imgs/sclite2.png)

Once the Backup button is clicked, a folder containing the json version of the app and a zip file will be created and downloaded to the local system.  When backing up all apps, all of the apps are stored in a single zip file when downloaded.

### Restore
Restoring an app requires selecting a specific user to create the app for.  Users in the Qlik Sense site appear in the drop down list.  To restore an app, pick a user and then choose to upload a zip or create an app from a server stored version of the app.  Click the restore button once a zip is uploaded or when ready to restore the online copy.  The app will be created and appear in the selected user's My Work area.

![3](https://github.com/eapowertools/QlikSenseQMCUtility/wiki/imgs/sclite3.png)
