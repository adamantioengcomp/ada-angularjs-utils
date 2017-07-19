backButton = require('angular').module('ada-back-button',[])
	.value('callbacks',[])
	.value('defaultCallback',[])
	.value('globalCallbacks',[])
	.factory('BackButton',['callbacks','defaultCallback','globalCallbacks','$location',function(callbacks,defaultCallback,globalCallbacks,$location){

			return{

				/**
				 * Add a default backbutton handler, which is called when 
				 * a matching callback is not found in the callbacks array.
				 */
				setDefaultCallback : function(callback){
					defaultCallback[0] = callback;
				},

				/**
				 * Register a global callback that is invocked every time a back button is pressed,
				 * even if a matching callback is found. The global callbacks are called first and,
				 * if one of then returns true, the callback chain stops and none of the other callbacks
				 * is called anymore.
				 */
				addGlobalCallback : function(callback){
					globalCallbacks.push(callback);
				},

				/**
				 * Add a callback for the location
				 */ 
				addEvent : function(location, callback){
					callbacks[location] = callback;
				},

				/**
				 * Add a callback for the current location
				 */ 
				addEvent : function(callback){
					callbacks[$location.path()] = callback;
				},

				/**
				 * Executes the back buton callback programatically
				 */
				executeBackButtonCallback : function(){
					for (var i in globalCallbacks){
						if (globalCallbacks[i]()) return;
					}

					if (callbacks[$location.path()]){
						callbacks[$location.path()]();
					}else{
						if (defaultCallback && defaultCallback[0])
							defaultCallback[0]();
					}
				}
			};

		}])
	.run(['callbacks','defaultCallback','globalCallbacks','$location','BackButton',function(callbacks,defaultCallback,globalCallbacks,$location,BackButton){
		var onBackButton = function(){
			BackButton.executeBackButtonCallback();		
		};

		$(document).on("backbutton", onBackButton);
	}]);

	