'use strict'

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

			saveSrv.getObject(author)
			.then(function(data) {
				$scope.films = (data.data.films);
			}, function() {
				searchSrv.getAuthor(author)
				.then(function(data) {
					if(data.data) {
						var films = data.data[0].filmography.actor;
						var filmList = filmListSrv.getPlayedAsActor(films);
						var doc = {};
						doc.films = filmList;
						$scope.films = filmList;
						saveSrv.setObject(author, JSON.stringify(doc));
					} else {
						$scope.films = 'Didn\'t recieve required data from IMDB api: ' + JSON.stringify(data);
					}
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

	.service('filmListSrv', function () {
		this.getPlayedAsActor = function (filmJSONArray) {
			var authorFilmArray = [];
			for(var i = 0; i < filmJSONArray.length; i++) {
				var type = filmJSONArray[i].type;
				if(type === 'Film') {
					authorFilmArray.push(filmJSONArray[i].title);
				}
			}
			return authorFilmArray;
		}
	})

	.service('saveSrv', function ($http) {
		this.setObject = function (key, value) {
			var url = '../../' + encodeURIComponent(key);
			$http.put(url, value);
		};

		this.getObject = function (key) {
			return $http.get('../../' + encodeURIComponent(key));
		};
	});
