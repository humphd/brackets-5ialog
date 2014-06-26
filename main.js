/*global define, $, brackets, Mustache, console */
define(function (require, exports, module) {
  "use strict";

  var _ = brackets.getModule("thirdparty/lodash");

  var Commands = brackets.getModule("command/Commands");
  var CommandManager = brackets.getModule("command/CommandManager");
  var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
  var Menus = brackets.getModule("command/Menus");
  var Dialogs = brackets.getModule("widgets/Dialogs");
  var FileSystem = brackets.getModule("filesystem/FileSystem");
  var DragAndDrop = brackets.getModule("utils/DragAndDrop");
  var AppInit = brackets.getModule("utils/AppInit");
  var ProjectManager = brackets.getModule("project/ProjectManager");
  var DocumentManager = brackets.getModule("document/DocumentManager");
  var ViewUtils = brackets.getModule("utils/ViewUtils");

  var COMMAND_OPEN_ID = "5ialog.open";
  var COMMAND_SAVEAS_ID = "5ialog.saveas";
  var openDialog = require("text!html/open.html");
  var saveAsDialog = require("text!html/saveas.html");
  var fileMenu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);

  var nodeId = 0;
  var baseModalHeight = 0;

  function closeModal() {
    Dialogs.cancelModalDialogIfOpen("5ialog");
    $(window).off('.5ialog');
  }

  function openPaths(paths) {
    var result = new $.Deferred;

    var filteredPaths = DragAndDrop.filterFilesToOpen(paths);

    var filesToOpen = filteredPaths.map(function(file) {
      return FileSystem.getFileForPath(file);
    });

    DocumentManager.addListToWorkingSet(filesToOpen);

    var lastPath = filteredPaths[filteredPaths.length - 1];

    DocumentManager.getDocumentForPath(lastPath)
      .done(function (doc) {
        DocumentManager.setCurrentDocument(doc);
        result.resolve(doc);
      });

    return result;
  }

  function fileToTreeJSON(file) {
    var json = {
      data: file.name,
      attr: { id: "node" + nodeId++ },
      metadata: {
        file: file
      }
    };

    if (file.isDirectory) {
      json.children = [];
      json.state = "closed";
      json.data = _.escape(json.data);
    } else {
      json.data = ViewUtils.getFileEntryDisplay(file);
    }

    return json;
  }

  function fileTreeDataProvider($tree, callback) {
    var rootPath, directory;

    // $tree is -1 when requesting the root
    if ($tree === -1) {
      rootPath = ProjectManager.getProjectRoot().fullPath;
      directory = FileSystem.getDirectoryForPath(rootPath);
    } else {
      directory = $tree.data('file');
    }

    directory.getContents(function(err, files) {
      var json = files.map(fileToTreeJSON);
      callback(json);
    });
  }

  function handleFileSelected(event, data) {
    console.log(event, data);
  }

  function handleFileDoubleClick(event) {
    var file = $(event.target).closest('li').data('file');

    if (file && file.isFile) {
      openPaths([file.fullPath]);
      closeModal();
    }
  }

  function handleOpen() {
    var data = {
      title: "Open",
      cancel: "Cancel",
      open: "Open"
    };

    Dialogs.showModalDialogUsingTemplate(Mustache.render(openDialog, data), false);

    var $dialog = $(".5ialog.instance");
    baseModalHeight = $dialog.height();

    initializeEventHandlers($dialog);

    var $container = $dialog.find('.open-files-container');

    var jstree = $container.jstree({
      plugins: ["ui", "themes", "json_data", "crrm"],
      json_data: { data: fileTreeDataProvider, correct_state: false },
      core: { html_titles: true, animation: 0, strings : { loading : "Loading", new_node : "New node" } },
      themes: {
        theme: "brackets",
        url: "styles/jsTreeTheme.css",
        dots: false,
        icons: false
      }
    });

    jstree
      .on('select_node.jstree', handleFileSelected)
      .on('dblclick.jstree', handleFileDoubleClick)
      .on('loaded.jstree open_node.jstree close_node.jstree', resizeModal);
  }

  function resizeModal() {
    var height = $('.5ialog .jstree').height();

    $('.5ialog.modal').height(baseModalHeight + height);
  }

  function initializeEventHandlers($dialog) {
    $dialog.find(".dialog-button[data-button-id='cancel']")
      .on("click", closeModal);

    $(window).on('keydown.5ialog', function (event) {
      if (event.keyCode === 27) {
        closeModal();
      }
    });

    $dialog.find(".dialog-button[data-button-id='open']").on("click", function () {
      var paths = $dialog.find('.jstree-clicked')
        .closest('li')
        .map(function () {
          return $(this).data().file.fullPath;
        })
        .get();

      if (!paths.length) { return; }

      openPaths(paths);
      closeModal();
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
