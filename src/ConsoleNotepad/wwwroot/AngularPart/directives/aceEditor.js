app.directive('ace', ['$timeout', function ($timeout) {

    var resizeEditor = function (editor, elem) {
        var lineHeight = editor.renderer.lineHeight;
        var rows = editor.getSession().getLength

        if (rows < 10) {
            rows = 10;
        }

        $(elem).height(rows * lineHeight);
        editor.resize();
    };

    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            ngModel: '=?',
            //language: '=ace'
        },
        link: function (scope, elem, attrs, ngModel) {
            var node = elem[0];
            //console.log(attrs.ace);

            var editor = ace.edit(node);

            editor.setTheme('ace/theme/monokai');

            //var MarkdownMode = require('ace/mode/markdown').Mode;
            var colorLanguage;
            if (attrs.ace == "Code") {
                colorLanguage = "javascript";
            } else if (attrs.ace == "View") {
                colorLanguage = "html";
            }

            console.log("language: " + colorLanguage);
            editor.getSession().setMode("ace/mode/" + colorLanguage);

            // set editor options
            editor.setShowPrintMargin(false);

            //aktualizacja tekstu w edytorze
            scope.$watch('ngModel', function () {
                //console.log("editor before: " + editor.getValue());
                if (editor.getValue() != scope.ngModel) {
                    editor.setValue(scope.ngModel, 1); 
                }
                //console.log("editor after: " + scope.ngModel);
            });

            editor.on('change', function () {
                $timeout(function () {
                    scope.$apply(function () {
                        var value = editor.getValue();
                        scope.ngModel = value;
                    });
                });

                resizeEditor(editor, elem);
            });


            if (attrs.readonly == true || attrs.readonly == "true") {
                editor.setReadOnly(true);
            }
        }
    };
}]);