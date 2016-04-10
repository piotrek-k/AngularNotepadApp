app.directive('viewLoader', function (notes, parts, $compile, fileUpload, $http) {
    return {
        restrict: 'AE',
        require: 'ngModel',
        scope: {
            ngModel: '=', //? - optional
            settings: '=partSettings'
        },
        link: function (scope, elem, attrs, ngModel) {
            //console.log("this");
            //console.dir(this);
            //console.table(attrs.partSettings);
            //console.log("scopesettingd");
            //console.table(scope.settings);
            if (scope.settings != undefined) {
                scope.oldSettings = scope.settings;

                scope.viewAdress = scope.settings["view"] != undefined ? scope.settings["view"] : "";
                scope.scriptAdress = scope.settings["script"] != undefined ? scope.settings["script"] : "";

                reloadView(scope.viewAdress);
                loadScript(scope.scriptAdress);
            }

            function reloadView(adress) {
                //console.log("adres: " + adress);
                if (adress != undefined && adress != "") {
                    //console.log("loading note");
                    notes.getByTag(adress).then(function (response) {
                        var noteData = response.data;
                        //console.log("noteloaded");
                        //console.table(noteData);
                        var currentNoteId = noteData.NoteId;
                        parts.get(currentNoteId).success(function (data) {
                            //console.log("part loaded");
                            //console.table(data);
                            if (data.length == 1) {
                                var html = data[0].Data;
                                elem.html(html);
                                $compile(elem.contents())(scope);
                            }
                            else {
                                console.error("Nieprawidlowa ilosc partow: " + data.length);
                            }
                        });
                    });
                }
            }

            function loadScript(adress) {
                if (adress != undefined && adress != "") {
                    notes.getByTag(adress).then(function (response) {
                        var noteData = response.data;
                        var currentNoteId = noteData.NoteId;
                        parts.get(currentNoteId).success(function (data) {
                            if (data.length == 1) {
                                console.log("Script '" + adress + "' successfully loaded.");
                                scope.evalFromParent(data[0].Data);
                            }
                            else {
                                console.error("Nieprawidlowa ilosc partow: " + data.length);
                            }
                        });
                    });
                }
            }

            scope.evalFromParent = function (data) {
                //evaluate some scripts from this position
                //console.log("Evaluated from parent");
                eval(data);
            }

            //attrs.$observe('partSettings', function (newval) {
            //    console.log("newval");
            //    //console.table(newval);

            //    if (scope.oldSettings["view"] != newval["view"]) {
            //        reloadView(newval["view"]);
            //    }
            //    else {
            //        console.log("brak zmian");
            //    }
            //});
        }
    };
});