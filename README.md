brackets-5ialog
===============

HTML5 File Dialogs for Brackets

##Introduction

This is an experimental extension mostly to help prototype dialogs for use with a browser-based filesystem vs. native OS dialogs.  It isn't (currently) meant to be used day-to-day, but can also be used with a standard Brackets install.

It adds 2 new items to the `File` menu:

* Open5 - show an HTML5 based "File > Open..." dialog
* SaveAs5 - show an HTML5 based "File > Save As..." dialog

##Testing/Debugging

You can either install this extension directly from GitHub (`File > Extension Manger > Install from URL... > https://github.com/humphd/brackets-5ialog/archive/master.zip`), or put brackets-5ialg in your local extensions folder.  Some tips from https://github.com/adobe/brackets/wiki/How-to-write-extensions on how to do that:

* Open your extensions folder by selecting "Help > Show Extensions Folder" in Brackets
* Inside the `user` folder(*), create place the `brackets-5ialog folder`.

\* Note: Because it's easy to delete extensions from this location via Extension Manager, in the long run it's _**safer** to develop inside the `src/extensions/dev`_ folder. You can do this by modifying the permissions of a regular installed build to make that folder writable, or by [cloning the Brackets source](https://github.com/adobe/brackets/wiki/How-to-Hack-on-Brackets) and using that copy.