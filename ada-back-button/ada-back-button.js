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
				addEventForLocation : function(location, callback){
					if(!callbacks[location]){
						callbacks[location] = [callback];
						return;
					}

					//Verifica se o callback já foi registrado para o local
					let exists = callbacks[location].find((cb)=>{
						return(cb.toString() == callback.toString())
					});
					//Se já existir, registra por cima do existente (para atualizar o escopo da função)
					if(exists){
						let cbs = callbacks[location];
						cbs[cbs.indexOf(exists)] = callback;
					}else{
						//Se não existe, registra o novo callback
						callbacks[location].push(callback);
					}					
				},

				/**
				 * Add a callback for the current location
				 */ 
				addEvent : function(callback){
					this.addEventForLocation($location.path(),callback);
				},

				/**
				 * Configura a função de callback, incluindo nera o parametro next, apontando para o 
				 * proximo callback na cadeia de callbacks
				 */
				executeNext(cb,route,index){
					var self = this;
					if (callbacks[route]){						
						let availableCallbacks = callbacks[route];
						let nextIndex = index-1;
						let nextFn = function(){ /* do nothing */};
						if(index > 0){							
							nextFn = availableCallbacks[nextIndex];
						}else if(index == 0){
							if (defaultCallback && defaultCallback[0]){
								nextFn = defaultCallback[0];
							}	
						}
						
						cb(function(){
							self.executeNext(nextFn,route,nextIndex);
						})
					}
				},

				/**
				 * Executes the back buton callback programatically
				 */
				executeBackButtonCallback : function(){
					debugger;
					//Primeiro executa os callbacks globais, na ordem em que foram registrados
					//Mas se algum retornar 'true', interrompe a corrente
					for (var i in globalCallbacks){
						if (globalCallbacks[i]()) return;
					}

					//Busca os callbacks registrados para a rota
					if (callbacks[$location.path()] && (callbacks[$location.path()].length > 0)){						
						let availableCallbacks = callbacks[$location.path()];

						//O callback a ser executado é o registrado por último
						let index = (availableCallbacks.length -1);
						var callbackToExecute = availableCallbacks[index];

						this.executeNext(callbackToExecute,$location.path(),index);
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

	