app.directive('appendScript', function (notes, parts) {
    return {
        restrict: 'AE',
        scope: {
            noteName: '=',
            //evalFromParent: '='
        },
        link: function (scope, elem, attrs) {
            console.log("loading script " + scope.noteName);
            notes.getByTag(scope.noteName).success(function (noteData) {
                console.table(noteData);
                scope.currentNoteId = noteData.NoteId;
                //checkForSpecialTags($scope.smartBar);

                scope.parts = parts.get(scope.currentNoteId).success(function (data) {
                    //whenPartsReceived(data);
                    console.log("Part with script received");
                    console.table(data);
                    console.table(data[0]);

                    if (data.length == 1) {
                        console.log("From parent" + scope.evalFromParent);
                        scope.$parent.evalFromParent(data[0].Data);
                        //if (scope.evalFromParent) {
                           
                            
                        //} else {
                        //    eval(data[0].Data);
                        //}
                    }
                    else {
                        console.error("Nieprawidlowa ilosc partow: " + data.length);
                    }
                });
            });
        }
    };
});