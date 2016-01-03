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
app.controller('editorController', function ($scope, notes) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) {
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
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        return $http.get('/api/notes')
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    notes.getSuggested = function (searchText) {
        //return $http.get('/api/notes/suggested?searchText=' + searchText);

        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
                  //.success(function (data) {
                  //    return data;
                  //})
                  //.error(function (err) {
                  //    return err;
                  //});
    }

    notes.post = function (keywords) {
        return $http.get('/api/notes/', { TagsToAdd: keywords })
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    notes.put = function (note) {
        return $http.get('/api/notes/', note)
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    return notes;
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
app.controller('editorController', function ($scope, notes) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) {
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

        if (event.keyCode == 13) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            for(var tag in $scope.suggestions[$scope.highlightedSuggestion]){
                $scope.smartBar += tag + " ";
            }
            
        }
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        return $http.get('/api/notes')
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    notes.getSuggested = function (searchText) {
        //return $http.get('/api/notes/suggested?searchText=' + searchText);

        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
                  //.success(function (data) {
                  //    return data;
                  //})
                  //.error(function (err) {
                  //    return err;
                  //});
    }

    notes.post = function (keywords) {
        return $http.get('/api/notes/', { TagsToAdd: keywords })
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    notes.put = function (note) {
        return $http.get('/api/notes/', note)
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    return notes;
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
app.controller('editorController', function ($scope, notes) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) {
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

        if (event.keyCode == 13) { //enter
            //uzupełnij inputa, zacznij pisanie notatki
            $scope.smartBar = "";
            for(var nt in $scope.suggestions[$scope.highlightedSuggestion].NoteTags){
                $scope.smartBar += nt.Tag.Name + " ";
            }
            
        }
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        return $http.get('/api/notes')
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    notes.getSuggested = function (searchText) {
        //return $http.get('/api/notes/suggested?searchText=' + searchText);

        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
                  //.success(function (data) {
                  //    return data;
                  //})
                  //.error(function (err) {
                  //    return err;
                  //});
    }

    notes.post = function (keywords) {
        return $http.get('/api/notes/', { TagsToAdd: keywords })
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    notes.put = function (note) {
        return $http.get('/api/notes/', note)
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    return notes;
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
app.controller('editorController', function ($scope, notes) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) {
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
            for(var nt in $scope.suggestions[$scope.highlightedSuggestion].NoteTags){
                $scope.smartBar += nt.Tag.Name + " ";
            }
            
        }
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        return $http.get('/api/notes')
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    notes.getSuggested = function (searchText) {
        //return $http.get('/api/notes/suggested?searchText=' + searchText);

        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
                  //.success(function (data) {
                  //    return data;
                  //})
                  //.error(function (err) {
                  //    return err;
                  //});
    }

    notes.post = function (keywords) {
        return $http.get('/api/notes/', { TagsToAdd: keywords })
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    notes.put = function (note) {
        return $http.get('/api/notes/', note)
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    return notes;
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
app.controller('editorController', function ($scope, notes) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) {
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
            for (var nt in $scope.suggestions[$scope.highlightedSuggestion].NoteTags) {
                console.table(nt);
                $scope.smartBar += nt.Tag.Name + " ";
            }
            
        }
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        return $http.get('/api/notes')
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    notes.getSuggested = function (searchText) {
        //return $http.get('/api/notes/suggested?searchText=' + searchText);

        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
                  //.success(function (data) {
                  //    return data;
                  //})
                  //.error(function (err) {
                  //    return err;
                  //});
    }

    notes.post = function (keywords) {
        return $http.get('/api/notes/', { TagsToAdd: keywords })
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    notes.put = function (note) {
        return $http.get('/api/notes/', note)
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    return notes;
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
app.controller('editorController', function ($scope, notes) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) {
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
            for (var nt in $scope.suggestions[$scope.highlightedSuggestion].NoteTags) {
                console.log(nt);
                $scope.smartBar += nt.Tag.Name + " ";
            }
            
        }
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        return $http.get('/api/notes')
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    notes.getSuggested = function (searchText) {
        //return $http.get('/api/notes/suggested?searchText=' + searchText);

        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
                  //.success(function (data) {
                  //    return data;
                  //})
                  //.error(function (err) {
                  //    return err;
                  //});
    }

    notes.post = function (keywords) {
        return $http.get('/api/notes/', { TagsToAdd: keywords })
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    notes.put = function (note) {
        return $http.get('/api/notes/', note)
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    return notes;
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
app.controller('editorController', function ($scope, notes) {
    $scope.suggestions = {};
    $scope.highlightedSuggestion = -1;

    $scope.smartBarKeyDown = function (event) {
        console.log("Refresh " + event.keyCode)
        if (event.keyCode == 32) {
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
            for (var nt in $scope.suggestions[$scope.highlightedSuggestion].NoteTags) {
                //console.log(nt);
                $scope.smartBar += $scope.suggestions[$scope.highlightedSuggestion].NoteTags[nt].Tag.Name + " ";
            }
            
        }
    }
});
app.factory('notes', ['$http', function ($http) {
    
    var notes = {};

    notes.get = function () {
        return $http.get('/api/notes')
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    notes.getSuggested = function (searchText) {
        //return $http.get('/api/notes/suggested?searchText=' + searchText);

        return $http({
            method: 'GET',
            url: '/api/notes/suggested?searchText=' + searchText,
            headers: {
                'Accept': 'application/json'
            }
        });
                  //.success(function (data) {
                  //    return data;
                  //})
                  //.error(function (err) {
                  //    return err;
                  //});
    }

    notes.post = function (keywords) {
        return $http.get('/api/notes/', { TagsToAdd: keywords })
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    notes.put = function (note) {
        return $http.get('/api/notes/', note)
                  .success(function (data) {
                      return data;
                  })
                  .error(function (err) {
                      return err;
                  });
    }

    return notes;
}]);