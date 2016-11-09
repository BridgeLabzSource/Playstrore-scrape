angular.module('MyApp')

    .controller('searchCtrl', function ($scope, $http, Upload, toastr) {
        $scope.find = function () {
            var gameName = { 'url': this.name };


            //sending game name to server
            // $http.post('http://localhost:3006/getAppDetails', gameName).success(function (data) {
            //     if (data) {
            //         console.log(data)
            //         var as = []
            //         as.push(data)
            //         $scope.data = as;

            //     }
            //     else {
            //         toastr.error('error');
            //     }

            // })
            
              //sending package name to server
             $http.post('http://localhost:3006/getCatagoryType', gameName).success(function (data) {
                if (data) {
                    console.log(data[0])
                    var as = []
                    as.push(data[0])
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
                for (var i = 1; i < allTextLines.length; i++) {
                    tarr.push(allTextLines[i])
                }

  /* remove comment and use  when u reading file which containes game name not package name
  */
                //     var h = tarr.toString();
                //     var s = h.split(',')
                //     //  console.log('dfsd',s)
                //     var ka = [];
                //     var p = 0;
                //     for (p = 6; p < s.length; p++) {

                //         ka.push(s[p]);
                //       p++;p++;p++;p++;


                //     }
                // console.log('gh',ka)
                var as = []
                var d = new Date();
                var stime = 0;
                var etime = 0;
                var ttime = 0;
                for (var i = 1; i < tarr.length - 1; i++) {

                    var gameName = { 'url': tarr[i] };
                    console.log(gameName)

                    stime = stime + d.getMilliseconds();
                    console.log('start time', stime);
                    //   sending game name to server

                    $http.post('http://localhost:3006/getAppDetails', gameName).success(function (data) {
                        if (data) {

                            as.push(data)

 
                        }
                        else {
                            toastr.error('error');
                        }

                    })
                    etime = etime + d.getMilliseconds();

                    console.log('end time', etime)

                }
                ttime = etime - stime;
                console.log('tota  time', ttime);
                //  console.log(as)
                $scope.data = as;

            }

            function errorHandler(evt) {
                if (evt.target.error.name == "NotReadableError") {
                    toastr.error("Canno't read file !");
                }
            }





        }


    })
