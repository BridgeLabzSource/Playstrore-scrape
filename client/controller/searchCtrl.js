angular.module('MyApp')

    .controller('searchCtrl', function ($scope, $http, Upload) {
        $scope.find = function () {
            var gameName = { 'url': this.name };


            //sending game name to server
            $http.post('http://localhost:3002/game', gameName).success(function (data) {
                if (data) {
                    console.log(data)
                    var as = []
                    as.push(data)
                    $scope.data = as;

                }
                else {
                    console.log('error');
                }

            })

        }

        $scope.uploadFiles = function (file) {

            console.log(file);
            if (window.FileReader) {
                // FileReader are supported.
                getAsText(file);
            } else {
                alert('FileReader are not supported in this browser.');
            }
            function getAsText(fileToRead) {
                var reader = new FileReader();
                // Read file into memory as UTF-8      
                reader.readAsText(fileToRead);
                // Handle errors load
                reader.onload = loadHandler;
                reader.onerror = errorHandler;
            }

            function loadHandler(event) {
                var csv = event.target.result;
                processData(csv);
            }

            function processData(csv) {
                var allTextLines = csv.split(/\r\n|\n/);
                var s = []
                var tarr = [];
                for (var i = 0; i < allTextLines.length; i++) {
                    tarr.push(allTextLines[i])
                }

                for (var j = 0; j < tarr.length; j++) {

                }
                var h = tarr.toString();
                var s = h.split(',')
                console.log(s)
                var ka = [];
                var p = 0;
                for (p = 3; p < s.length; p++) {

                    ka.push(s[p]);
                    p++;

                }
                var as = []
                for (var i = 0; i < ka.length; i++) {
                    var gameName = { 'url': ka[i] };
                    //sending game name to server
                    $http.post('http://localhost:3002/game', gameName).success(function (data) {
                        if (data) {
                            console.log(data)

                            as.push(data)


                        }
                        else {
                            console.log('error');
                        }

                    })
                }
                $scope.data = as;
            }

            function errorHandler(evt) {
                if (evt.target.error.name == "NotReadableError") {
                    alert("Canno't read file !");
                }
            }




            //  if(file!==null){
            //      Upload.upload({
            //             url: 'http://localhost:3000/imageUpload',
            //             data: {
            //                 file: file,
            //                 key:$stateParams.ProKey
            //             }
            //         }).then(function (response) {

            //                 $scope.result = response.data;
            //                  toastr.success($scope.result);
            //                 console.log("hii", $scope.result);

            //         });

            //  }
        }


    })