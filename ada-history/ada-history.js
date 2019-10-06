require('angular').module('history', [])
	.value('history', [])
	.value('status', { current: -1, goingBack: false, goingForward: false })
	.factory('History', ['history', '$location', 'status','localStorageService', function (history, $location, status, localStorageService) {

		return {

			/**
			 * Navigate back to a specific page
			 * @param {Object} params optional parameter that makes possible to
			 *				   change/add params of the target url before goes back.
			 *				   must be displayed as a key/value pair
			 */
			backTo: function (url, params,pageName) {
				status.goingBack = true;
				for (var i in history) {
					var index = history[i].indexOf("?");
					if (history[i].slice(0, (index > -1) ? index : undefined) == url) {
						status.current = i;
						var prevUrl = history[i];
						//var prevUrl = url;
						//history.slice(0,Number(i)+1);
						break;
					}
				}

				if (prevUrl) {
					for (i in params) {
						var index = prevUrl.indexOf("?" + i + "=");
						if (index < 0) index = prevUrl.indexOf("&" + i + "=");
						if (index > -1) {
							var tmp = prevUrl.substr(index + 1);
							if (tmp.indexOf("&") > 0) {
								tmp = tmp.substr(0, tmp.indexOf("&"));
							}
							prevUrl = prevUrl.replace(tmp, i + "=" + params[i]);
						} else {
							if (prevUrl.indexOf("?") > -1)
								prevUrl += "&";
							else
								prevUrl += "?";
							prevUrl += (i + "=" + params[i]);
						}
					}
				}

				if (pageName) {
					if (!prevUrl) {
						window.location = `/${pageName}/#/`
					} else {
						window.location = `/${pageName}/#${prevUrl}`
					}
					
				} else {
					window.location = "#" + prevUrl;
				}
			},

			/**
			 * Navigate to the previous page
			 * @param {Object} params optional parameter that makes possible to
			 *				   change/add params of the target url before goes back.
			 *				   must be displayed as a key/value pair
			 */
			back: function (params) {
				status.goingBack = true;

				//Se não houver nenhuma url na pilha, utiliza o voltar do navegador
				if(status.current == 0){
					return window.history.back();
				}


				(status.current > 0) ? status.current-- : status.current = 0;				

				var prevUrl = history.length > 0 ? history[status.current] : "/";

				for (i in params) {
					var index = prevUrl.indexOf("?" + i + "=");
					if (index < 0) index = prevUrl.indexOf("&" + i + "=");
					if (index > -1) {
						var tmp = prevUrl.substr(index + 1);
						if (tmp.indexOf("&") > 0) {
							tmp = tmp.substr(0, tmp.indexOf("&"));
						}
						prevUrl = prevUrl.replace(tmp, i + "=" + params[i]);
					} else {
						if (prevUrl.indexOf("?") > -1)
							prevUrl += "&";
						else
							prevUrl += "?";
						prevUrl += (i + "=" + params[i]);
					}
				}

				window.location = "#" + prevUrl;
			},

			/**
			 * Navigate to the next page
			 */
			forward: function () {
				status.goingForward = true;
				(status.current > 0) && (status.current < (history.length - 1)) ? status.current++ : status.current = 0;
				var nextUrl = history.length > 0 ? history[status.current] : "/";
				$location.path(nextUrl);
			},

			/**
			 * Clear the history
			 */
			clear: function () {
				status.current = 0;
				history.splice(0, history.length);
			}
		};

	}])
	.run(['$rootScope', 'history', '$location', 'status', '$transitions','localStorageService',function ($rootScope, history, $location, status,$transitions,localStorageService) {

		var changeEvent = function () {
			if (!status.goingBack && !status.goingForward) {
				//history.push($location.$$url);
				status.current++;

				//Evita entradas repetidas em sequencia
				if(history[status.current-1] && (history[status.current-1] == $location.$$url)) return;

				history[status.current] = $location.$$url;
			} else {
				status.goingBack = false;
				status.goingForward = false;
			}
		};

		$rootScope.$on('$routeChangeSuccess', function () {
			changeEvent();
		});

		$rootScope.$on('$stateChangeSuccess', function () {
			changeEvent();
		});

		$transitions.onSuccess({}, function () {			
			changeEvent();
		});

	}]);