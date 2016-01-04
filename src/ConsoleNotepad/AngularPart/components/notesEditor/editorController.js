app.controller('editorController', function ($scope, notes, parts, focusOn) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;
    $scope.currentNoteId = 0;
    $scope.parts = [
        {
            Data: "new"
        }
    ];
    var timeoutUpdate; //setTimeout to update Part
    var editingPartOptions = {};
    $scope.focusOnPart = 0;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) { //space
            $scope.suggestions = notes.getSuggested($scope.smartBar).success(function (data) {
                console.table(data);
                $scope.suggestions = data;
            });
            console.log("Refreshed");
        }

        if (event.keyCode == 40 && $scope.highlightedSuggestion < $scope.suggestions.length-1) { //arrow down
            event.preventDefault();
            $scope.highlightedSuggestion++;
        }
        if (event.keyCode == 38 && $scope.highlightedSuggestion > -1) { //arrow up
            event.preventDefault();
            $scope.highlightedSuggestion--;
        }

        if (event.keyCode == 13 && $scope.highlightedSuggestion > -1) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            console.table($scope.suggestions[$scope.highlightedSuggestion].NoteTags);
            var note = $scope.suggestions[$scope.highlightedSuggestion];
            console.table(note);
            for (var nt in note.NoteTags) {
                //console.log(nt);
                $scope.smartBar += note.NoteTags[nt].Tag.Name + " ";
            }

            $scope.currentNoteId = note.NoteId;
            $scope.parts = parts.get($scope.currentNoteId).success(function (data) {
                $scope.parts = data;
            });

        }
    }

    $scope.editingPartKeyDown = function (event, partObjIndex) {
        clearTimeout(timeoutUpdate);
        timeoutUpdate = setTimeout(function () { updatePart(partObjIndex) }, 3000);
        //timeoutUpdate = setTimeout(function () { alert("chuj");}, 3000);

        //2x enter dodaje nowy part
        //console.log(partObj.Data);

        var partObj = $scope.parts[partObjIndex];
        if (event.keyCode == 13 && /\s*<br>\s*<br>\s*$/.test(partObj.Data)) { //enter
            //console.log("three enters");
            //console.log("before: " + $scope.parts[partObjIndex].Data);
            //$scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*$/g, "");
            //console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
            event.preventDefault(); //żeby nie dawało już tego entera
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        //console.log("lastIndex: " + lastIndex);
        //console.table($scope.parts);
        $scope.parts.splice(lastIndex + 1, 0, { Data: "new" }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + (lastIndex + 1));
    }
});