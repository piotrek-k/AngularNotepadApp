app.controller('editorController', function ($scope, notes, parts, focusOn, $element, $timeout) {
    $scope.windowId = 0;

    $scope.suggestions = {};
    $scope.currentNoteId = 0;
    $scope.currentNoteObject = {}; //wszystkie dane nt. aktualnie pokazywanej notatki (pobrane z bazy)
    $scope.noteReadOnly = false;
    var timeoutUpdate; //setTimeout to update Part
    $scope.activePart = 0;

    $scope.noteType = "Normal"; //typ notatki, dostosowuje edytor

    getPartsByTag(); //ładuje notatkę która nie ma tagów (strona startowa)

    $scope.setWindowID = function (index) {
        console.log("windowID: " + index)
        $scope.windowId = index;
    }

    $scope.openHistory = function (idOfPart) {
        $("#windowsContainer").scope().addWindow(undefined, "%backup " + idOfPart + " 1");
    }

    $scope.$on('remotely-modify-window', function (e, args) {
        //uzywane przez windowsController
        if (args.i == $scope.$index) {
            if (args.noteName != undefined) {
                $scope.smartBar = args.noteName;
            }
            if ($scope.smartBar == undefined) {
                $scope.smartBar = "";
            }
            getPartsByTag();
        }
    });

    //aktualizacja części notatki. Czeka kilka sekund zanim wyśle aktualizację.
    $scope.editingPartKeyDown = function (event, partObjIndex) {
        if (!$scope.noteReadOnly) {
            clearTimeout(timeoutUpdate);
            timeoutUpdate = setTimeout(function () {

                $scope.parts[partObjIndex].localState = "Sending";

                parts.put($scope.parts[partObjIndex]).success(function () {
                    $scope.parts[partObjIndex].localState = "OK";
                }).error(function () {
                    $scope.parts[partObjIndex].localState = "Problem";
                });

            }, 1000);
            $scope.parts[partObjIndex].localState = "Sending";
        }
    }

    function getPartsByTag() {
        //timeout jest potrzebny, bo bez niego smartBar nie zdąży się zaktualizować
        $timeout(function () {

            if ($scope.smartBar == undefined) {
                $scope.smartBar = "";
            }

            if ($scope.smartBar.indexOf("%backup ") > -1) { //użytkownik chce pobrać historię part'a
                var getNumbers = $scope.smartBar.match(/(?!(\s))[0-9]+(?=(\s|$))/gi);
                var idOfBackup = getNumbers[0];
                var pageOfBackup = getNumbers[1];
                console.log("id of backup to take" + idOfBackup);
                parts.history(idOfBackup, pageOfBackup).then(function (response) {
                    $scope.noteReadOnly = true;
                    var dataAboutPB = response.data;
                    for (var p in dataAboutPB) {

                        //wygeneruj opcje ustawień
                        if (dataAboutPB[p].SettingsAsJSON == undefined) {
                            dataAboutPB[p].Settings = {};
                        }
                        else {
                            dataAboutPB[p].Settings = JSON.parse(dataAboutPB[p].SettingsAsJSON);
                        }

                        dataAboutPB[p].displayData = {}; //informacje o wyswietlaniu np. ustawien
                    }

                    $scope.parts = dataAboutPB;

                    notes.getOne(dataAboutPB[0].OriginalPart.NoteID).then(function (response) {
                        $scope.noteType = notes.typeToString(response.data.TypeOfNote);
                        $scope.currentNoteObject = response.data;
                    }, function (response) { })

                }, function (response) { });
            }
            else {
                notes.getByTag($scope.smartBar).then(function (response) {
                    console.log("Note succesfully loaded: " + $scope.smartBar);
                    //console.dir(response);

                    $scope.currentNoteId = response.data.NoteId;
                    $scope.noteType = notes.typeToString(response.data.TypeOfNote);
                    $scope.currentNoteObject = response.data;
                    $scope.noteReadOnly = false;

                    $scope.parts = parts.get($scope.currentNoteId).success(function (data) {

                        console.log("Parts succesfully loaded: " + $scope.currentNoteId);

                        for (var p in data) {

                            //wygeneruj opcje ustawień
                            if (data[p].SettingsAsJSON == undefined) {
                                data[p].Settings = {};
                            }
                            else {
                                data[p].Settings = JSON.parse(data[p].SettingsAsJSON);
                            }

                            data[p].displayData = {}; //informacje o wyswietlaniu np. ustawien
                        }

                        $scope.parts = data;

                        partsCheckForNull(); //jesli notatka nie ma partow, dodaj nowe

                    });

                }, function (response) {
                    if (response.status == 404) {
                        //nie znaleziono notatki, mozna utworzyć nową
                        console.log("Nie znaleziono żądanej notatki");
                        $scope.askToAddNewNote = $scope.smartBar; //wyswietl menu dodawania nowej
                    }
                });
            }
        });
    }

    $scope.addPart = function () {
        var atIndex = $scope.activePart + 1;

        $scope.parts.splice(atIndex, 0, { Data: "&nbsp;", NoteID: $scope.currentNoteId }); //add at index

        focusOn("part" + atIndex + "window" + $scope.$index); //przenieś kursor do nowego parta

        $scope.parts[atIndex].localState = "Sending";
        $scope.parts[atIndex].OrderPosition = $scope.parts[atIndex - 1].OrderPosition + 1;

        //to samo dzieje sie na serwerze. Przydzielanie wszystkim partom pozycji
        for (var a in $scope.parts) {
            if (a != atIndex && $scope.parts[a].OrderPosition >= $scope.parts[atIndex].OrderPosition) {
                $scope.parts[a].OrderPosition++;
            }
        }

        parts.post($scope.parts[atIndex]).success(function (data) {

            $scope.parts[atIndex].ID = data.ID;
            $scope.parts[atIndex].localState = "OK";
            $scope.parts[atIndex].displayData = {};
            $scope.parts[atIndex].displayData.quickViewSetter = true;
            $scope.parts[atIndex].Settings = {};

        }).error(function () {
            $scope.parts[atIndex].localState = "Problem";
        });
    }

    function partsCheckForNull() {
        if ($scope.parts.length == 0 || $scope.parts == null) {
            $scope.addPart();
        }
    }

    $scope.focusedOnPart = function (i) { //gdy jakis part złapie focusa
        $scope.activePart = i;
    }

    $scope.suggestionListCallback = function (noteId) { //funkcja wywoływana przez suggestion-list
        $scope.parts = {};
        $scope.askToAddNewNote = undefined;
        getPartsByTag();
    }

    $scope.addNote = function (name) {
        var newNote = {
            "TagsToAdd": name
        };

        notes.post(newNote).then(function (response) {
            $scope.askToAddNewNote = undefined;
            getPartsByTag();
        });
    }

    $scope.saveChangesToNote = function () {
        notes.put($scope.currentNoteObject).then(function (response) {
            $scope.smartBar = $scope.currentNoteObject.TagsToAdd;
            getPartsByTag();
        });
    }

    $scope.deleteSetting = function (partIndex, settingName) {
        delete $scope.parts[partIndex].Settings[settingName];
        $scope.editingPartKeyDown(null, $scope.activePart); //update na serwer
    }

    $scope.getViews = function () {
        //szybki wybór widoków do nowej części notatki
        notes.getPopularViews().then(function (response) {
            if ($scope.quickViewsContainer == [] || $scope.quickViewsContainer == null) {
                $scope.quickViewsContainer = response.data;
            }
        });
    }

    $scope.setViewToPart = function (partIndex, viewTagi) {
        $scope.parts[partIndex].Settings["view"] = viewTagi + "";
        $scope.parts[partIndex].displayData.quickViewSetter = false; //ukryj menu
        $scope.editingPartKeyDown(null, $scope.activePart);
    }
});