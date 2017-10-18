var dialogs = require('angular').module('ada-dialogs', []);

dialogs.provider('dialogs', [function () {
	var self = this;

	var dialogTitles = {
		alert: 'Atenção',
		error: 'Erro',
		info: 'Application',
		confirm: 'Confirmação'
	};

	var translator = undefined;

	this.useTranslatorFuncion = function (translatorFuncion) {
		translator = translatorFuncion;
	};

	this.useDialogTitles = function (titles) {
		for (var i in titles) {
			dialogTitles[i] = titles[i];
		};
	};

	this.$get = ['$q', '$translate', '$mdDialog', function ($q, $translate, $mdDialog) {


		var resolveTranslation = function (msg) {
			if (translator) {
				translator(msg);
			} else if ($translate) {
				return $translate.instant(msg);
			} else
				return msg;
		};

		return {

			alert: function (msg) {
				var deferred = $q.defer();
				if (navigator.notification) {
					navigator.notification.alert(msg, function () { deferred.resolve(); }, resolveTranslation(dialogTitles.alert), 'OK');
				} else {
					$mdDialog.show(
						$mdDialog.alert()
							.clickOutsideToClose(false)
							.title(resolveTranslation(dialogTitles.alert))
							.textContent(msg)
							.ariaLabel(resolveTranslation(dialogTitles.alert))
							.ok('OK')
					).then(async function () {
						deferred.resolve();
					})
				}
				return deferred.promise;
			},

			error: function (msg) {
				var deferred = $q.defer();
				if (navigator.notification) {
					navigator.notification.alert(msg, function () { deferred.resolve(); }, resolveTranslation(dialogTitles.error), 'OK');
				} else {
					$mdDialog.show(
						$mdDialog.alert()
							.clickOutsideToClose(false)
							.title(resolveTranslation(dialogTitles.error))
							.textContent(msg)
							.ariaLabel(resolveTranslation(dialogTitles.error))
							.ok('OK')
					).then(async function () {
						deferred.resolve();
					})
				}
				return deferred.promise;
			},

			info: function (msg) {
				var deferred = $q.defer();
				if (navigator.notification) {
					navigator.notification.alert(msg, function () { deferred.resolve(); }, resolveTranslation(dialogTitles.info), 'OK');
				} else {
					$mdDialog.show(
						$mdDialog.alert()
							.clickOutsideToClose(false)
							.title(resolveTranslation(dialogTitles.info))
							.textContent(msg)
							.ariaLabel(resolveTranslation(dialogTitles.info))
							.ok('OK')
					).then(async function () {
						deferred.resolve();
					})
				}
				return deferred.promise;
			},

			confirm: function (msg, btOkName, btCancelName) {
				var deferred = $q.defer();

				if (!btOkName) {
					btOkName = 'OK';
				}
				if (!btCancelName) {
					btCancelName = 'Cancela';
				}

				if (navigator.notification) {

					var mCallback = function (index) {

						if (index === 1) {
							deferred.resolve();
						} else {
							deferred.reject();
						}
					};

					navigator.notification.confirm(msg, mCallback, resolveTranslation(dialogTitles.confirm), btOkName + ',' + btCancelName);

					return deferred.promise;
				} else {

					var confirm = $mdDialog.confirm()
						.title(resolveTranslation(dialogTitles.confirm))
						.textContent(msg)
						.ariaLabel(resolveTranslation(dialogTitles.confirm))
						.ok(btOkName)
						.cancel(btCancelName);

					$mdDialog.show(confirm).then(
						async function () {
							deferred.resolve();
						},
						async function () {
							deferred.reject();
						})

					return deferred.promise;
				}
			}

		}

	}];

}])