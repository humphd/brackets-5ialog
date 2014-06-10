/*global define, $, brackets, Mustache, console */
define(function (require, exports, module) {
  "use strict";

  var Commands = brackets.getModule("command/Commands");
  var CommandManager = brackets.getModule("command/CommandManager");
  var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
  var Menus = brackets.getModule("command/Menus");
  var Dialogs = brackets.getModule("widgets/Dialogs");
  var FileSystem = brackets.fs;
  var AppInit = brackets.getModule("utils/AppInit");

  var COMMAND_OPEN_ID = "5ialog.open";
  var COMMAND_SAVEAS_ID = "5ialog.saveas";
  var openDialog = require("text!html/open.html");
  var saveAsDialog = require("text!html/saveas.html");
  var fileMenu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);

  function isVisible(item) {
    return item.substring(0, 1) !== ".";
  }

  function closeModal() {
    Dialogs.cancelModalDialogIfOpen("5ialog");
    $(window).off('.5ialog');
  }

  function handleOpen() {
    FileSystem.readdir("/", function (err, entries, stats) {
      var data = {
        title: "Open",
        cancel: "Cancel",
        open: "Open",
        error: err,
        entries: entries.filter(isVisible)
      };
      var dialog;

      Dialogs.showModalDialogUsingTemplate(Mustache.render(openDialog, data), false);
      dialog = $(".5ialog.instance");

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
