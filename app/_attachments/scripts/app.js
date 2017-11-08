'use strict'

/*var tariffs = [
	    			{'kleur': 'Rood', 'max': 3, 'start': 9, 'einde': 22, 'dagen': [0, 1, 2, 3, 4, 5],
	    			'tarief': [1.60, 2.70, 3.80]},
	    			{'kleur': 'Donkergroen', 'max': 10, 'start': 9, 'einde': 19, 'dagen': [0, 1, 2, 3, 4, 5],
	    			'tarief': [0.70, 1.10], 'dagticket': 3.80},
	    			{'kleur': 'Lichtgroen', 'max': 10, 'start': 9, 'einde': 19, 'dagen': [0, 1, 2, 3, 4, 5],
	    			'tarief': [0.70, 1.10]},
	    			{'kleur': 'Geel', 'max': 10, 'start': 9, 'einde': 19, 'dagen': [0, 1, 2, 3, 4, 5],
	    			'tarief': [0.50]},
	    			{'kleur': 'Oranje', 'max': 10, 'start': 9, 'einde': 19, 'dagen': [0, 1, 2, 3, 4, 5],
	    			'tarief': [0.50], 'dagticket': 2.70},
	    			{'kleur': 'Blauw', 'max': 2, 'start': 9, 'einde': 18, 'dagen': [0, 1, 2, 3, 4, 5],
	    			'tarief': [0]}
	    		];*/

angular.module('movieApp', ['ngRoute'])

	.config(function ($routeProvider) {
		$routeProvider
			.when('/home', {
				templateUrl: 'assets/views/home.html',
				controller: 'homeCtrl'
			})
			.otherwise({
                redirectTo: '/home'
            });;
	})

	.controller('homeCtrl', function ($scope, searchSrv, filmListSrv, saveSrv) {

		$('#searchButton').on('click', function (e) {
			var author = $('#authorText').val().toLowerCase();
			
			console.log(author);

			saveSrv.getObject(author)
			.then(function(data) {
				console.log(JSON.stringify(data.data.films));
				$scope.films = (data.data.films);
			}, function() {
				searchSrv.getAuthor(author)
				.then(function(data) {
					console.log(data);
					var films = data.data[0].filmography.actor;
					var filmList = filmListSrv.getPlayedAsActor(films);
					console.log(JSON.stringify(filmList));
					var doc = {};
					doc.films = filmList;
					$scope.films = doc;
					saveSrv.setObject(author, JSON.stringify(doc));
				});
			});
		});
	})

	.service('searchSrv', function ($http, $q) {
		this.getAuthor = function (author) {
			var q = $q.defer();
			var url = 'http://theimdbapi.org/api/find/person?name=' + encodeURIComponent(author);

			$http.get(url)
				.then(function (data) {
					q.resolve(data);
				}, function error(err) {
					q.reject(err);
				});

			return q.promise;
		};
	})

	.service('filmListSrv', function ($http, $q) {
		this.getPlayedAsActor = function (filmJSONArray) {
			var authorFilmArray = [];
			console.log(authorFilmArray.length)
			for(var i = 0; i < filmJSONArray.length; i++) {
				var type = filmJSONArray[i].type;
				console.log(type)
				if(type === 'Film') {
					authorFilmArray.push(filmJSONArray[i].title);
				}
			}
			return authorFilmArray;
		}
	})

	.service('saveSrv', function ($window, $http) {
		this.setObject = function (key, value) {
			var url = '../../' + encodeURIComponent(key);
			$http.put(url, value);
		};

		this.getObject = function (key) {
			//return JSON.parse($window.localStorage[key] || '{}');
			return $http.get('../../' + encodeURIComponent(key));
		};
	});
