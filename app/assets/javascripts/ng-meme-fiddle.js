var memeFiddle = angular.module('memeFiddle', ["ui.bootstrap", "angularFileUpload"]);

// Services
memeFiddle.factory("$fiddle",function($rootScope){
    var fiddle = {};
    fiddle.stage = {};
    fiddle.pid = null;
    fiddle.imageCounter = 0;
    fiddle.imageurl = null;

    fiddle.updatePid = function (pid) {
    	this.pid = pid;
    	$rootScope.$broadcast('updatePid');
    };

    fiddle.createStage = function (container, width, height) {
    	if (angular.isObject(this.stage)) {
	    	this.stage = new Kinetic.Stage({
				container: container,
				width: width,
				height: height
			});

			var layer = new Kinetic.Layer();
			var rect = new Kinetic.Rect({
		        x: 0,
		        y: 0,
		        width: width,
		        height: height,
		        fill: 'white'
		    });
			layer.add(rect);
			this.stage.add(layer);

			this.stage.draw();
	    }
    };

    fiddle.changeStage = function (width, height) {
    	this.stage.setSize(width, height);
    	this.stage.children[0].children[0].setSize(width, height);
    }
    
    return fiddle;
});

// Routes
memeFiddle.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', { templateUrl: 'pages/newimage.html', controller: 'NewMemeCtrl' })
				  .when('/p/:pid', { templateUrl: 'pages/image.html', controller: 'LoadMemeCtrl'})
				  .when('/browse', { templateUrl: 'pages/browse.html', controller: 'BrowseCtrl'})
				  .otherwise({ redirectTo: '/' });
}]);

// Directives
memeFiddle.directive('kineticcanvas', ['$fiddle', function ($fiddle) {
	return {
    	restrict: 'E',
    	link: function ($scope, element, attrs) {
    		$fiddle.createStage(attrs.id, 600, 500);
    	}
    }
}]);

// Controllers
memeFiddle.controller('MemeCtrl', ['$scope', '$http', '$routeParams', '$location', '$fiddle', '$modal', '$window', function($scope, $http, $routeParams, $location, $fiddle, $modal, $window) {
	$scope.addImage = function() {
		var modalInstance = $modal.open({
    		templateUrl: 'addPhotoModalTemplate.html',
    		controller: 'PhotoModalInstanceCtrl'
    	});

		modalInstance.result.then(function (modalphoto) {
			var layer = new Kinetic.Layer({
				draggable: true
			});

			var image = new Image();
			image.src = modalphoto;
			
			var img = new Kinetic.Image({
	        	image: image,
	         	id: 'img_' + $fiddle.imageCounter++,
	         	src: image.src
	        });

			var stageWidth = $fiddle.stage.getWidth();
			var stageHeight = $fiddle.stage.getHeight();

			image.onload = function () {
				if (stageWidth < this.width) {
					$fiddle.stage.setWidth(this.width + 4);
				}

				if (stageHeight < this.height) {
					$fiddle.stage.setHeight(this.height + 4);
				}
			}

			// brings image to front
			// img.on('mousedown', function(event) {
			// // 	layer.setZIndex(3000);
			// 	console.log('yeah');
			// 	img.setScale(5);
			// });

			layer.add(img);
			$fiddle.stage.add(layer);

			layer.batchDraw();

			// loop every layer and move text to top
			sendTextToFront($fiddle.stage);

			$fiddle.stage.draw();

		}, function() {
			//canceled
		});
		
	};

	$scope.addText = function() {
		var modalInstance = $modal.open({
    		templateUrl: 'addTextModalTemplate.html',
    		controller: 'TextModalInstanceCtrl'
    	});

		modalInstance.result.then(function (modaltext) {

			if (angular.isDefined(modaltext)) {
		    	var layer = new Kinetic.Layer({
					draggable: true
				});

				layer.on('mousedown', function() {
					this.moveToTop();
					this.draw();
				});

				var text = new Kinetic.Text({
			        text: modaltext.toUpperCase(),
			        fontSize: 80,
			        fontFamily: 'Impact',
			        fill: 'white',
			        stroke: 'black',
			        strokeWidth: 4
			    });

			    text.on('dblclick', function(event) {
			    	console.log('do something', $modal);
			    	var modalInstance2 = $modal.open({
			    		templateUrl: 'addTextModalTemplate.html',
			    		controller: 'TextModalInstanceCtrl'
			    	});

			    	modalInstance2.result.then(function (modaltext) {
			    		console.log('fuck');
			    	});

			    });

			    // text.on('mousedown', function(event) {
			    	// text.setScale(2);
					//layer.setScale(2);
				// });

				layer.add(text);
				$fiddle.stage.add(layer);
			}

	    }, function () {
	    	// cancelled
	    });
	};

	$scope.viewImage = function() {
		if ($fiddle.imageurl == null) {
			// null
		} else {
			$window.location.href = $fiddle.imageurl;
		}

		//var canvas = $('#' + id).find('canvas');

		//$fiddle.stage.toDataURL({
          //callback: function(dataUrl) {
            /*
             * here you can do anything you like with the data url.
             * In this tutorial we'll just open the url with the browser
             * so that you can see the result as an image
             */
            //window.open(dataUrl);
          //}
        //});
	};

	$scope.saveFiddle = function() {

		if ($fiddle.stage.children.length <= 1) {
			alert('Please an image or some text');
			return;
		}
		
		var json = $fiddle.stage.toJSON();

		
		$fiddle.stage.toDataURL({
        	callback: function(imgdata) {
            	$http({
            		method: 'POST', 
            		url: '/fiddles', 
            		headers: {
				    	'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
				  	},
            		data: {json: json, imgdata: imgdata}
            		}).
					success(function(data, status, headers, config) {
						$location.path( "/p/" + data.uniquecode);
						$fiddle.pid = data.uniquecode;
					}).
					error(function(data, status, headers, config) {
						// called asynchronously if an error occurs
						// or server returns response with an error status.
				});
        	}
        });
	};

	$scope.changeCanvas = function(width, height) {
		$fiddle.changeStage(width, height);
	};

	$scope.changeCanvasCustom = function() {
		var modalInstance = $modal.open({
    		templateUrl: 'customCanvasSizeModalTemplate.html',
    		controller: 'CustomCanvasModalInstanceCtrl'
    	});

		modalInstance.result.then(function (dimensions) {
			$fiddle.changeStage(dimensions.width, dimensions.height);
	    }, function () {
	    	// cancelled
	    });
	};

	$scope.href = "#";
	$scope.$on('updatePid', function() {
        $scope.pid = $fiddle.pid;

        if (angular.isDefined($fiddle.pid)) {
			$scope.href = "#/p/" + $fiddle.pid;
		}
    });

    var sendTextToFront = function(obj) {
    	var children = obj.getChildren();
    	
    	if (obj.nodeType === "Shape") {
    		if (obj.className === "Text") {
    			obj.parent.moveToTop();
    			obj.parent.batchDraw();
    			return;
    		}
    	}

    	if (children.length > 0) {
    		for (var i=children.length-1; i >= 0; i--) {
    			sendTextToFront(obj.children[i]);
    		}
    	}
    };

}]);

memeFiddle.controller('NewMemeCtrl', ['$scope', '$http', '$routeParams', '$fiddle', function($scope, $http, $routeParams, $fiddle) {
	// New Meme Controller
}]);

memeFiddle.controller('LoadMemeCtrl', ['$scope', '$http', '$routeParams', '$fiddle', function($scope, $http, $routeParams, $fiddle) {
	var recurseImgs = function(json) {
		if (angular.isUndefined(json)) {
			return;
		}

		if (json.className === "Image") {
			var imageObj = new Image();
			imageObj.onload = function() {
				$fiddle.stage.get('#' + json.attrs.id)[0].setImage(imageObj);
				$fiddle.stage.draw();
			};
			imageObj.src = json.attrs.src;
		}

		if (angular.isUndefined(json.children)) {
			return;
		}
		if (json.children.length <= 0) {
			return;
		}
		
		angular.forEach(json.children, function(child) {
			recurseImgs(child);
		});
	};

    $fiddle.updatePid($routeParams.pid)
    
	$http({method: 'GET', url: '/fiddles/' + $routeParams.pid}).
		success(function(data, status, headers, config) {
			if (angular.isObject(data)) {
				$fiddle.stage = Kinetic.Node.create(data.json, 'canvas');
				$fiddle.imageurl = "preview/" + $routeParams.pid + ".png"
				recurseImgs(angular.fromJson(data.json));
			}
		}).
		error(function(data, status, headers, config) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
	});





      //var stage = Kinetic.Node.create(json, 'canvas');

      /*
       * set functions
       */
      // stage.get('#blueRectangle').on('mouseover mouseout', function() {
      //   var stroke = this.getStroke();
      //   this.setStroke(stroke === 'black' ? 'red' : 'black');
      //   stage.draw();
      // });


	

			

}]);

memeFiddle.controller('BrowseCtrl', ['$scope', '$http', '$routeParams', '$fiddle', function($scope, $http, $routeParams, $fiddle) {
	// console.log('Load Browse Controller');

	$http({method: 'GET', url: '/fiddles'}).
    	success(function(data, status, headers, config) {
	    	// console.log('lots of data', data);
	    	$scope.memes = data;
    	}).
    	error(function(data, status, headers, config) {
    		//error
    });
	//$scope.fiddle = $fiddle;

	//console.log('new meme', $fiddle.getStage());
	//console.log('new meme fid', $fiddle);
	 //$scope.$watch('$fiddle', function(myObject){
        //myObject.doSomething();
      //  console.log('fuck', $fiddle.stage)
    //});
}]);

memeFiddle.controller('TextModalInstanceCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance) {
	$scope.modal = {};

	$scope.add = function () {
		$modalInstance.close($scope.modal.modaltext);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
}]);

memeFiddle.controller('PhotoModalInstanceCtrl', ['$scope', '$modalInstance', '$http', function($scope, $modalInstance, $http) {
	$scope.modal = {};
	// $scope.modal.imageurl = '';
	$scope.validimage = false;
	
	$scope.selectedFiles = [];
	$scope.onFileSelect = function($files, index) {
		$scope.uploadResult = [];
		$scope.selectedFile = index == 1 ? $files[0] : null;
		$scope.message = "<p>Uploading... <img src='assets/images/ajax-loader.gif'/></p>";
		$scope.alert = "alert-info";
		$http.uploadFile({
			url : 'pictures',
			headers: {
		    	'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
		  	},
			data : {
				myModel : $scope.myModel
			},
			file : $files[0]
		}).success(function(data, status, headers, config) {
			$scope.validimage = true;
			$scope.message = "Upload Complete";
			$scope.alert = "alert-success";
			$scope.modal.photopath = data.path;
			
			// to fix IE not refreshing the model
			if (!$scope.$$phase) {
				$scope.$apply();
			}
		}).error(function(msg) {
			$scope.validimage = false;
			$scope.alert = "alert-danger";
			$scope.message = "An error occurred";
		});
		
	};

	$scope.$watch('modal.imageurl', function(value) {
		if (angular.isDefined(value) && value.length > 0) {
			$scope.validimage = true;
			$scope.modal.photopath = value;
		} else {
			$scope.validimage = false;
		}
	}, true);

	$scope.add = function () {
		$modalInstance.close($scope.modal.photopath);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
}]);

memeFiddle.controller('CustomCanvasModalInstanceCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance) {
	$scope.modal = {};

	$scope.add = function () {
		$modalInstance.close({width: $scope.modal.width, height: $scope.modal.height});
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
}]);