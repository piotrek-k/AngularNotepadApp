app.directive('keyboardShortcutsManager', function ($document) {
    return {
        restrict: 'AE',
        scope: false, //uzywam scope controllera w któym jest directive
        link: function (scope, el, attrs) {
            scope.keysPressed = [];
            var keyChange = false; //wcisniety inny przycisk niz wczesniej
            var numberOfKeysPressed = 0;

            //console.log("directive dziala");

            $document.bind("keydown keyup", keychangeEvent);
            $document.bind("keydown", keypressEvent);

            function keychangeEvent(e) {
                keyChange = (scope.keysPressed[e.keyCode] != (e.type == 'keydown'));
                scope.keysPressed[e.keyCode] = (e.type == 'keydown');
                if (keyChange) {
                    if (scope.keysPressed[e.keyCode]) {
                        numberOfKeysPressed++;
                    }
                    else {
                        numberOfKeysPressed--;
                    }
                }
            }

            function keypressEvent(e) {
                if (keyChange) {
                    if (arePressed(["ctrl", "alt"])) {
                        //nowa część notatki
                        scope.jumpToWindow();
                        e.preventDefault();
                    }

                    if (arePressed(["ctrl", "space"])) {
                        //podział okna na kolejną część
                        scope.addWindow();
                        e.preventDefault();
                    }

                    if (arePressed(["ctrl", "shift", "space"])) {
                        //zamknij okno
                        scope.removeWindow();
                        e.preventDefault();
                    }

                    if (arePressed(["alt", "*"])) {
                        var number = getNumberPressed();
                        scope.jumpToWindow(number-1);
                    }
                }
            }

            function arePressed(a) {
                //* - dowolny przycisk

                //console.log("a length: " + a.length);
                if (a == undefined || a == null || numberOfKeysPressed != a.length) {
                    return false;
                }
                for (var x in a) {
                    //console.log("name to id: " + nameToID(a[x]));
                    //var result = true;
                    if (!scope.keysPressed[nameToID(a[x])] && a[x] != "*") {
                        return false; //jeden z przycisków nie jest wciśnięty
                    }
                    //return result;
                }
                return true;
            }

            function getNumberPressed() {
                //console.dir(scope.keysPressed);
                for (var num = 49; num < 57; num++) { //sprawdzenie wszystkich liczb
                    if (scope.keysPressed[num]) {
                        return parseInt(String.fromCharCode(num));
                    }
                }
                return -1;
            }

            function nameToID(name) {
                switch (name) {
                    case "ctrl":
                        return 17;
                        break;
                    case "enter":
                        return 13;
                        break;
                    case "shift":
                        return 16;
                        break;
                    case "alt":
                        return 18;
                        break;
                    case "backspace":
                        return 8;
                        break;
                    case "space":
                        return 32;
                        break;
                    default:
                        if (name.length == 1) {
                            return name.charCodeAt(0);
                        }
                        break;
                }
            }
        }
    };
});