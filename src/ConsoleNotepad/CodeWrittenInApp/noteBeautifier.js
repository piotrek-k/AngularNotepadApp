console.log("beautifier ping");
//
var noteContent = ngModel.$viewValue; //zmienic na ngModelValue, jak juz wejda zmiany
var objectToModify = elem;

var splitted = noteContent.split("<br>");
console.dir(splitted);
var settings = {};

var finalHtml = "";

for (var x in splitted) {
    splitted[x] = addElemByFirstChar("unorderedList", "*", "li", "ul", splitted[x]);
    splitted[x] = urlify(splitted[x], 20);
    splitted[x] = jsnLinks(splitted[x]);
    splitted[x] = addElemByFirstAndLastChar(splitted[x], "\\^\\^\\^", "\\^\\^\\^", "h3");
    splitted[x] = addElemByFirstAndLastChar(splitted[x], "\\^\\^", "\\^\\^", "h2");
    splitted[x] = addElemByFirstAndLastChar(splitted[x], "\\^", "\\^", "h1");

    finalHtml += (splitted[x] === "") ? "<br>" : splitted[x];
}

function addElemByFirstChar(id, specialChar, elementToAddEachLine, globalElem, line) {
    if (settings[id] === undefined) {
        settings[id] = false;
    }
    if (line.charAt(0) == specialChar) {
        line = line.substr(1, line.length);
        line = "<" + elementToAddEachLine + ">" + line + "</" + elementToAddEachLine + ">";

        if (!settings[id]) {
            //add global elem
            line = "<" + globalElem + ">" + line;
        }
        settings[id] = true;
    }
    else {
        if (settings[id]) {
            //close global elem
            line = line + "</" + globalElem + ">";
        }
        settings[id] = false;
    }
    return line;
}

function addElemByFirstAndLastChar(line, start, end, elem) {
    var a = start + "[^\\s" + start + "]+([0-9A-Za-zżźćńółęąśŻŹĆĄŚĘŁÓŃ]|\\s|\\W)+" + end;
    console.log(a);
    var re = new RegExp(a, "g");

    return line.replace(re, function (text) {
        //console.log(text);
        text = text.replace(new RegExp(start, "g"), "");
        text = text.replace(new RegExp(end, "g"), "");
        return '<' + elem + '>' + text + '</' + elem + '>';
    });
}

function urlify(text, shortenBy) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
        var shortened = url;
        shortened = shortened.replace(/https?:\/\//g, "");
        shortened = (shortened.length > shortenBy) ? shortened.substr(0, shortenBy - 1) + '&hellip;' : shortened;
        return '<a href="' + url + '">' + shortened + '</a>';
    })
}

function jsnLinks(lineText) {
    var regex = /jsn\[([0-9A-Za-zżźćńółęąśŻŹĆĄŚĘŁÓŃ]|\s)*\]/g;
    // regex = /jsn\[(\w|\s)*\]/gu;
    return lineText.replace(regex, function (jsnlink) {
        //console.log("jsnlink: " + jsnlink);
        var noteName = jsnlink.replace(/jsn\[/g, "");
        noteName = noteName.replace(/\]/g, "");
        //console.log("noteName: " + noteName);
        return '<goto x="' + noteName + '">' + noteName + '</goto>';
    });
}

elem.html(finalHtml);
//console.log(finalHtml);
$compile(elem.contents())(scope);