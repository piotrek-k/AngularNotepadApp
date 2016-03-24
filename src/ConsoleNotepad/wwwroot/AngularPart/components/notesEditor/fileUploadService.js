app.factory('fileUpload', ['$http', function ($http) {
    var fileUpload = {};

    fileUpload.sendFiles = function (formData) {
        return $http({
            method: 'POST',
            url: '/api/fileupload',
            data: formData,
            processData: false,  // tell jQuery not to process the data
            contentType: false,  // tell jQuery not to set contentType
        }).then(function (response) {
            //success
            return response;
        }, function (response) {
            //error
            return response;
        });
    };

    fileUpload.sendFilesFromInput = function (htmlObject) { //htmlObject - $("#file")
        var formData = new FormData();
        var files = htmlObject[0].files;
        var totalFiles = files.length;
        console.log("totalFiles: " + totalFiles);
        for (var i = 0; i < totalFiles; i++) {
            var file = files[i];

            formData.append("files", file);
        }

        return this.sendFiles(formData);
    }

    return fileUpload;
}]);