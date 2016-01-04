(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
app.controller('editorController', function ($scope, notes, parts) {
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
        if (event.keyCode == 13) { //enter
            /\s*<br>\s*<br>\s*$/.test(partObj.Data);
            console.log("three enters");
            addPart();
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart() {
        $scope.parts.push({Data: "new"});
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
        if (event.keyCode == 13) { //enter
            /\s*<br>\s*<br>\s*$/.test(partObj.Data);
            console.log("three enters");
            addPart();
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart() {
        $scope.parts.push({Data: "new"});
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
        if (event.keyCode == 13) { //enter
            /\s*<br>\s*<br>\s*$/.test(partObj.Data);
            console.log("three enters");
            addPart();
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart() {
        $scope.parts.push({ Data: "new" });
        focusOn("part");
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
        if (event.keyCode == 13) { //enter
            /\s*<br>\s*<br>\s*$/.test(partObj.Data);
            console.log("three enters");
            addPart();
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart() {
        $scope.parts.push({ Data: "new" });
        var index = $scope.parts.length;
        focusOn("part");
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
        if (event.keyCode == 13) { //enter
            /\s*<br>\s*<br>\s*$/.test(partObj.Data);
            console.log("three enters");
            addPart();
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart() {
        $scope.parts.push({ Data: "new" });
        var index = $scope.parts.length-1;
        focusOn("part");
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
        if (event.keyCode == 13) { //enter
            /\s*<br>\s*<br>\s*$/.test(partObj.Data);
            console.log("three enters");
            addPart();
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart() {
        $scope.parts.push({ Data: "new" });
        var index = $scope.parts.length-1;
        focusOn("part" + index);
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            ;
            console.log("three enters");
            addPart();
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart() {
        $scope.parts.push({ Data: "new" });
        var index = $scope.parts.length-1;
        focusOn("part" + index);
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            console.log("three enters");
            addPart();
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart() {
        $scope.parts.push({ Data: "new" });
        var index = $scope.parts.length-1;
        focusOn("part" + index);
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            console.log("three enters");
            addPart();
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        $scope.parts.splice()
        var index = $scope.parts.length-1;
        focusOn("part" + index);
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            console.log("three enters");
            addPart();
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        $scope.parts.splice(lastIndex + 1, 0, { Data: "new" });
        var index = $scope.parts.length-1;
        focusOn("part" + index);
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            console.log("three enters");
            addPart();
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        $scope.parts.splice(lastIndex + 1, 0, { Data: "new" }); //add at index
        var index = $scope.parts.length-1;
        focusOn("part" + index);
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            console.log("three enters");
            addPart();
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        $scope.parts.splice(lastIndex + 1, 0, { Data: "new" }); //add at index
        focusOn("part" + index);
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            console.log("three enters");
            addPart();
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        $scope.parts.splice(lastIndex + 1, 0, { Data: "new" }); //add at index
        focusOn("part" + lastIndex + 1);
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            console.log("three enters");
            addPart();
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        $scope.parts.splice(lastIndex + 1, 0, { Data: "new" }); //add at index
        focusOn("part" + (lastIndex + 1));
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            addPart();
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        $scope.parts.splice(lastIndex + 1, 0, { Data: "new" }); //add at index
        focusOn("part" + (lastIndex + 1));
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            addPart();
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        console.log("lastIndex: " + lastIndex);
        $scope.parts.splice(lastIndex + 1, 0, { Data: "new" }); //add at index
        focusOn("part" + (lastIndex + 1));
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            addPart();
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        console.log("lastIndex: " + lastIndex);
        console.table($scope.parts);
        $scope.parts.splice(lastIndex + 1, 0, { Data: "new" }); //add at index
        console.log("after");
        console.table($scope.parts);
        focusOn("part" + (lastIndex + 1));
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            addPart(partObjIndex);
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        console.log("lastIndex: " + lastIndex);
        console.table($scope.parts);
        $scope.parts.splice(lastIndex + 1, 0, { Data: "new" }); //add at index
        console.log("after");
        console.table($scope.parts);
        focusOn("part" + (lastIndex + 1));
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            addPart(partObjIndex);
        }
    }
    
    function updatePart(index) {
        console.log("update");
        var partObj = $scope.parts[index];
        parts.put(partObj);
    }

    function addPart(lastIndex) {
        //$scope.parts.push({ Data: "new" });
        console.log("lastIndex: " + lastIndex);
        console.table($scope.parts);
        $scope.parts.splice(lastIndex + 1, 0, { Data: "new" }); //add at index
        //console.log("after");
        //console.table($scope.parts);
        focusOn("part" + (lastIndex + 1));
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            addPart(partObjIndex);
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
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            $scope.parts[partObjIndex].replace(/<br>\s*$/, "");
            addPart(partObjIndex);
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
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            $scope.parts[partObjIndex].replace(/<br>\s*$/, ""); //usun ostatni enter
            addPart(partObjIndex);
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
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            $scope.parts[partObjIndex].Data.replace(/<br>\s*$/, ""); //usun ostatni enter
            addPart(partObjIndex);
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
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            $scope.parts[partObjIndex].Data.replace(/<br>\s*$/g, ""); //usun ostatni enter
            addPart(partObjIndex);
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
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            $scope.parts[partObjIndex].Data.replace(/<br>\s*$/g, ""); //usun ostatni enter
            $scope.parts[partObjIndex].Data = "chuj";
            addPart(partObjIndex);
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
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            $scope.parts[partObjIndex].Data.replace(/<br>\s*$/g, ""); //usun ostatni enter
            addPart(partObjIndex);
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
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            addPart(partObjIndex);
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
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            console.log("before: " + $scope.parts[partObjIndex].Data);
            $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
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
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            console.log("before: " + $scope.parts[partObjIndex].Data);
            $scope.parts[partObjIndex].Data = $scope.parts[partObjIndex].Data.replace(/\s*<br>\s*<br>\s*$/g, ""); //usun ostatni enter
            console.log("after: " + $scope.parts[partObjIndex].Data);
            addPart(partObjIndex);
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
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
            event.preventDefault();
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
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);
(function () {
    'use strict';

    
})();

var app = angular.module('ConsoleNotepad', [
        // Angular modules 
        'ngRoute'

        // Custom modules 

        // 3rd Party Modules

]);

app.directive('contenteditable', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});
app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        scope.$on('focusOn', function (e, name) {
            if (name === attr.focusOn) {
                elem[0].focus();
            }
        });
    };
});

app.factory('focusOn', function ($rootScope, $timeout) {
    return function (name) {
        $timeout(function () {
            $rootScope.$broadcast('focusOn', name);
        });
    }
});
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
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        //TODO
        //return $http.get('/api/notes')
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.getSuggested = function (searchText) {
        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    notes.post = function (keywords) {
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    notes.put = function (note) {
        console.table(note);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return notes;
}]);
app.factory('parts', ['$http', function ($http) {

    var parts = {};

    parts.get = function (idOfNote) {
        //TODO
        return $http({
            method: 'GET',
            url: '/api/parts?idOfNote=' + idOfNote,
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    parts.post = function (nextPart) {
        console.log("nextPart:");
        console.table(nextPart);
        //TODO
        //return $http.get('/api/notes/', { TagsToAdd: keywords })
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    parts.put = function (part) {
        //console.table(part);
        //TODO
        //return $http.get('/api/notes/', note)
        //          .success(function (data) {
        //              return data;
        //          })
        //          .error(function (err) {
        //              return err;
        //          });
    }

    return parts;
}]);