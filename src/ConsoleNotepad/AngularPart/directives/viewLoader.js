app.directive('viewLoader', function (notes, parts) {
    return {
        restrict: 'AE',
        require: 'ngModel',
        scope: {
            ngModel: '=?',
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

                reloadView(scope.viewAdress);
            }

            function reloadView(adress) {
                //console.log("adres: " + adress);
                if (adress != undefined && adress != "") {
                    //console.log("loading note");
                    notes.getByTag(adress).success(function (noteData) {
                        //console.log("noteloaded");
                        //console.table(noteData);
                        var currentNoteId = noteData.NoteId;
                        parts.get(currentNoteId).success(function (data) {
                            //console.log("part loaded");
                            //console.table(data);
                            if (data.length == 1) {
                                var html = data[0].Data;
                                elem.html(html);
                            }
                            else {
                                console.error("Nieprawidlowa ilosc partow: " + data.length);
                            }
                        });
                    });
                }
            }

            attrs.$observe('partSettings', function (newval) {
                //console.log("newval");
                //console.table(newval);

                if (scope.oldSettings["view"] != newval["view"]) {
                    reloadView(newval["view"]);
                }
                else {
                    console.log("brak zmian");
                }
            });
        }
    };
});