angular.module('MyApp')

    .controller('searchCtrl', function ($scope, $http, Upload,toastr) {
        $scope.find = function () {
            var gameName = { 'url': this.name };


            //sending game name to server
            $http.post('http://localhost:3004/game', gameName).success(function (data) {
                if (data) {
                    console.log(data)
                    var as = []
                    as.push(data)
                    $scope.data = as;

                }
                else {
                   toastr.error('error');
                }

            })

        }

        $scope.uploadFiles = function (file) {

            console.log(file);
            if (window.FileReader) {
                // FileReader are supported.
                getAsText(file);
            } else {
                 toastr.error('FileReader are not supported in this browser.');
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

          
                var h = tarr.toString();
                var s = h.split(',')
                //  console.log('dfsd',s)
                var ka = [];
                var p = 0;
                for (p = 6; p < s.length; p++) {

                    ka.push(s[p]);
                  p++;p++;p++;p++;
                    

                }
            console.log('gh',ka)
                var as = []
                for (var i = 0; i < ka.length; i++) {
                    var gameName = { 'url': ka[i] };
                    // console.log(gameName)
                  //sending game name to server
                    $http.post('http://localhost:3004/game', gameName).success(function (data) {
                        if (data) {
                            console.log(data)
                            as.push(data)
                          }
                        else {
                            toastr.error('error');
                        }

                    })
                }
                $scope.data = as;
            }

            function errorHandler(evt) {
                if (evt.target.error.name == "NotReadableError") {
                     toastr.error("Canno't read file !");
                }
            }




         
        }


    })