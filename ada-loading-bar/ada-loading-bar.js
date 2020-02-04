var loadingBar = require('angular').module('ada-loading-bar',[]);
loadingBar.factory('LoadingBar',['$q',function($q){

	var running = false;

	return{

		/**
		 * Shows the loading bar
		 */
		show : function(){
			if (!running){
				running = true;
				$("#loading").modal('show');
			}
		},

		/**
		 * Hides the loading bar
		 */
		hide : function(){
			var deferred = $q.defer();
			if (running){
				running = false;
				$("#loading").modal('hide');
				$("#loading").on('hidden.bs.modal',function(){
					deferred.resolve();
				});
			}

			return deferred.promise;
		},

		/**
		 * Toggles the loading bar
		 */ 
		toggle : function(){
			running = !running;
			$("#loading").modal('toggle');
		},

		/**
		 * Checks if LoadingBar is running
		 */ 
		isRunning:function(){
			return running;
		},
	};
	
}]).directive('loading', function(){


	return {
		restrict: 'E',
		scope:{
			msg:'@message',
			icon:'=icon',
		},
		template:require('./ada-loading-bar.html')
	};
});

module.exports = loadingBar;