app.directive('focusOn', function () {
    return function (scope, elem, attr) {
        //console.table(scope);
        scope.$on('focusOn', function (e, name) {
            //console.log("name: " + name + " attr.focusOn: " + attr.focusOn);
            if (name === attr.focusOn) {
                elem[0].focus();
                //console.log("true");
                //console.table(elem[0]);
            }

            if (typeof window.getSelection != "undefined"
                && typeof document.createRange != "undefined") {
                var range = document.createRange();
                range.selectNodeContents(elem[0]);
                range.collapse(false);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            } else if (typeof document.body.createTextRange != "undefined") {
                var textRange = document.body.createTextRange();
                textRange.moveToElementText(elem[0]);
                textRange.collapse(false);
                textRange.select();
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