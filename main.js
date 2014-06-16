/*global define, $, brackets, Mustache, console */
define(function (require, exports, module) {
  "use strict";

  var Commands = brackets.getModule("command/Commands");
  var CommandManager = brackets.getModule("command/CommandManager");
  var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
  var Menus = brackets.getModule("command/Menus");
  var Dialogs = brackets.getModule("widgets/Dialogs");
  var FileSystem = brackets.getModule("filesystem/FileSystem");
  var AppInit = brackets.getModule("utils/AppInit");
  var ProjectManager = brackets.getModule("project/ProjectManager");
  var DocumentManager = brackets.getModule("document/DocumentManager");

  var COMMAND_OPEN_ID = "5ialog.open";
  var COMMAND_SAVEAS_ID = "5ialog.saveas";
  var openDialog = require("text!html/open.html");
  var saveAsDialog = require("text!html/saveas.html");
  var fileListPartial = require("text!html/file-list.html");
  var fileMenu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);

  var partials = {
    "file-list": fileListPartial
  };

  function isVisible(item) {
    return item.substring(0, 1) !== ".";
  }

  function closeModal() {
    Dialogs.cancelModalDialogIfOpen("5ialog");
    $(window).off('.5ialog');
  }

  function getEntriesFromFiles(files) {
    var entries = files.map(function (file) {
      return {
        name: file.name,
        className: file.isFile ? "file" : "directory",
        fullPath: file.fullPath
      };
    });
    return entries;
  }

  function openPath(path) {
    var result = new $.Deferred;

    DocumentManager.getDocumentForPath(path)
      .done(function (doc) {
        DocumentManager.setCurrentDocument(doc);
        result.resolve(doc);
      });

    return result;
  }

  function handleOpen() {
    var path = ProjectManager.getProjectRoot().fullPath;
    var root = FileSystem.getDirectoryForPath(path);

    root.getContents(function (err, files) {
      var entries = getEntriesFromFiles(files);

      var data = {
        title: "Open",
        cancel: "Cancel",
        open: "Open",
        error: err,
        entries: entries
      };
      var dialog;

      Dialogs.showModalDialogUsingTemplate(Mustache.render(openDialog, data, partials), false);
      dialog = $(".5ialog.instance");

      dialog.on("click", ".directory", function () {
        var $directory = $(this);
        var path = $directory.attr("data-path");

        FileSystem.getDirectoryForPath(path).getContents(function (err, files) {
          var entries = getEntriesFromFiles(files);

          var data = {
            error: err,
            entries: entries
          };

          var $list = $(Mustache.render(fileListPartial, data));
          $list.appendTo($directory);
        });
      });

      dialog.on("dblclick", ".file", function () {
        var $file = $(this);
        var path = $file.attr("data-path");

        openPath(path).always(function () {
          closeModal();
        });
      });

      dialog.find(".dialog-button[data-button-id='cancel']")
        .on("click", closeModal);

      $(window).on('keydown.5ialog', function (event) {
        if (event.keyCode === 27) {
          closeModal();
        }
      });

      dialog.find(".dialog-button[data-button-id='open']").on("click", function () {
        console.log("Open!");
        // TODO: trigger open handler...
        closeModal();
      });
    });
  }

  function handleSaveAs() {
    var data = {
      title: "Save",
      cancel: "Cancel",
      save: "Save"
    };
    var dialog;

    Dialogs.showModalDialogUsingTemplate(Mustache.render(saveAsDialog, data), false);
    dialog = $(".5ialog.instance");

    dialog.find(".dialog-button[data-button-id='cancel']").on("click", function () {
      Dialogs.cancelModalDialogIfOpen("5ialog");
    });

    dialog.find(".dialog-button[data-button-id='save']").on("click", function () {
      console.log("Save!");
      // TODO: trigger save handler...
      Dialogs.cancelModalDialogIfOpen("5ialog");
    });
  }

  ExtensionUtils.loadStyleSheet(module, "css/styles.css");

  CommandManager.register("Open5", COMMAND_OPEN_ID, handleOpen);
  CommandManager.register("SaveAs5", COMMAND_SAVEAS_ID, handleSaveAs);

  fileMenu.addMenuItem(COMMAND_OPEN_ID,
   null,
   Menus.AFTER,
   Commands.FILE_OPEN);
  fileMenu.addMenuItem(COMMAND_SAVEAS_ID,
   null,
   Menus.AFTER,
   Commands.FILE_SAVE_AS);

});
