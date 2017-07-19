/**
 * Module for programatically controlling the form component controls.
 * Use the "control" directive to marck the elements to be controlled
 * Use the adaControl service functions to navigate between the control components
 */
require('angular').module('ada-controls',[])
.value('activeFocus',{field:undefined})
.directive('control', ['$window','activeFocus', function ($window,activeFocus) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {                 
            element.focus(function(){
                activeFocus.field = this;
            });
        }
    };
}])
.provider('adaControl',[function(){

    var checkNextField = function(currentField){
        return false;
    };

    /**
     * Register a function callback to verify a field before setting focus
     *@param {function} callback the callback to register. Receives a control component and
     *                           must return the object witch is the next control, or return 
     *                           false to return to the next control in html
     */
    this.useFieldCheckFunction = function(callback){
        checkNextField = callback;
    };  

    this.$get = ['activeFocus','$timeout', function(activeFocus,$timeout){

        var isValidField = function(field){
            return (!field.hasAttribute('disabled') && $(field).is(':visible'));
        };

        return {
            /**
             * @return {Object} the active focus element 
             */
            getActiveFocus : function(){
                return activeFocus.field;
            },

            /**
             * Set the active focus on a control element on the page
             * @param {String|Object} field the object or the selector of the field
             */
            setActiveFocus : function(field){
                if (typeof field === "string")
                    field = $(field);

                if (!field) return;

                activeFocus.field = field;
                if ((field.tagName !== 'INPUT')&&(field.querySelector))
                    field = field.querySelector('input');

                field.focus();
                $timeout(function(){(field.querySelector('input') ||  field).select();},200);
            },

            /**
             * Tells if a field is the first control of the page
             * @param {String|object} field the object or the selector of the field
             * @return {boolean}
             */
            isFirstControl : function(field){
                if (!field)
                    field = activeFocus.field;

                if (typeof field === "string")
                    field = $(field);

                return (this.getFirstControl() === field);
            },

            /**
             * Tells if a field is the last control of the page
             * @param {String|object} field the object or the selector of the field
             * @return {boolean}
             */
            isLastControl : function(field){
                if (!field)
                    field = activeFocus.field;

                if (typeof field === "string")
                    field = $(field);

                return (this.getLastControl() === field);
            },

            /**
             * Find the last control element on the page
             * @param  {undefined|boolean} validateField tells if the field must be valid (true) or not (false). 
             *                                           a valid field is enabled and visible on the screen.
             *                                           if ommited, true is considerated
             * @return {object} the last control element on the page
             */
            getLastControl : function(validateField){            
                var inputs = $("[control]");

                if (!inputs) return undefined;

                if (validateField == false)
                    return inputs[inputs.length - 1];

                // Verify if the control is valid
                if (isValidField(inputs[inputs.length - 1])){ 
                    return inputs[inputs.length - 1];
                }else{
                    // If the control is not valid, search for the next

                    var opt = {};// Create the options, for a new call, so it don't miss the original reference                    
                    opt.baseField = inputs[inputs.length - 1]; // Search for the next field, starting from the last
                    opt.stopOnLast = true;     // Stop on last (first in this case), for prevent infinite loop (where there is no valid control on the page)
                    opt.reverse = true;        // The search is bottow - up
                    opt.validateField = validateField;
                    return this.getNextControl(opt);
                }
            },

            /**
             * Find the first control element on the page
             * @param  {undefined|boolean} validateField tells if the field must be valid (true) or not (false). 
             *                                           a valid field is enabled and visible on the screen.
             *                                           if ommited, true is considerated
             * @return {object} the first control element on the page
             */
            getFirstControl : function(validateField){
                var inputs = $("[control]");

                if (!inputs) return undefined;

                if (validateField == false)
                    return inputs[0];

                // Verify if the control is valid
                if (isValidField(inputs[0])){ 
                    return inputs[0];
                }else{
                    // If the control is not valid, search for the next

                    var opt = {};// Creates the options, for a new call, so it don't miss the original reference
                    opt.baseField = inputs[0]; // Search for the next field, starting from the first
                    opt.stopOnLast = true;     // Stop on last, for prevent infinite loop (where there is no valid control on the page)
                    opt.reverse = false;       // The search is top - down
                    opt.validateField = validateField;
                    return this.getNextControl(opt);
                }
            },

            /**
             * Set the active control on the fitst element on the page
             * @param  {undefined|boolean} validateField tells if the field must be valid (true) or not (false). 
             *                                           a valid field is enabled and visible on the screen.
             *                                           if ommited, true is considerated
             */
            firstControl : function(validateField){
                var ctrl = this.getFirstControl(validateField);
                if (ctrl){ 
                    (ctrl.querySelector('input') ||  ctrl).focus();
                    $timeout(function(){(ctrl.querySelector('input') ||  ctrl).select();},200);
                }
            },

            /**
             * Set the active control on the last element on the page
             * @param  {undefined|boolean} validateField tells if the field must be valid (true) or not (false). 
             *                                           a valid field is enabled and visible on the screen.
             *                                           if ommited, true is considerated
             */
            lastControl : function(validateField){
                var ctrl = this.getLastControl(validateField);
                if (ctrl){ 
                    (ctrl.querySelector('input') ||  ctrl).focus();
                    $timeout(function(){(ctrl.querySelector('input') ||  ctrl).select();},200);
                }
            },

            /**
             * find the next element on the page
             * if "useFieldCheckFunction" was used to register a check function, the
             * function will be used to check for the next control to go.
             * @param {undefined|object} options optional parameter that setups the options for the search.
             *                                   <b>baseField</b>: {undefined|string|object} a field to start the search from (ignores the active control). Can be the control object or a selector string
             *                                   <b>stopOnLast</b>: {undefined|boolean} if set to true, when the function called from the last page, nothing will happens
             *                                   <b>reverse</b>: {undefined|boolean} if set to true, the navigation will become 
             *                                   <b>validateField</b>: {undefined|boolean} tells if the field must be valid (true) or not (false). a valid field is enabled and visible on the screen. if ommited, true is considerated
             * @return {object} the last control element on the page
             */
            getNextControl : function(options){
                var baseField = (options && options.baseField) ? options.baseField : activeFocus.field;

                /*if (this.isLastControl((options && options.baseField) ? options.baseField : undefined)){
                    if (options && options.stopOnLast)
                        return null;
                    else
                        baseField = undefined;
                }*/

                var inputs = $("[control]");
                if (!baseField || (baseField && !baseField.hasAttribute('control'))){                    
                    return (options && options.reverse) ? 
                            this.getLastControl(options ? options.validateField : undefined) : 
                            this.getFirstControl(options ? options.validateField : undefined);
                }else{
                    var selectNext = false;
                    for (var i in inputs){              
                        if ((inputs[i] && inputs[i] === baseField) || selectNext){
                            
                            var nextField = (options && options.reverse) ? inputs[Number(i)-1] : inputs[Number(i)+1];                            

                            if (nextField){
                                var field = checkNextField(baseField) || nextField;
                                
                                if ((options && (options.validateField === false)) || isValidField(field)){
                                    return field;
                                    break;
                                }else{
                                    selectNext = true;
                                }
                            }else if (options && options.stopOnLast){
                                return null;
                            }else{
                                return (options && options.reverse) ? 
                                    this.getLastControl(options ? options.validateField : undefined) : 
                                    this.getFirstControl(options ? options.validateField : undefined);
                            }
                        }
                    }                    
                }
            },

            /**
             * Sets the active control on next element on the page
             * if "useFieldCheckFunction" was used to register a check function, the
             * function will be used to check for the next control to go.
             * @param {undefined|object} options optional parameter that setups the options for the search.
             *                                   <b>baseField</b>: {undefined|string|object} a field to start the search from (ignores the active control). Can be the control object or a selector string
             *                                   <b>stopOnLast</b>: {undefined|boolean} if set to true, when the function called from the last page, nothing will happens
             *                                   <b>reverse</b>: {undefined|boolean} if set to true, the navigation will become 
             *                                   <b>validateField</b>: {undefined|boolean} tells if the field must be valid (true) or not (false). a valid field is enabled and visible on the screen. if ommited, true is considerated
             * @return {object} the last control element on the page
             */
            nextControl : function(options){
                var field = this.getNextControl(options);
                // Se o next field for um elemento que possui um input dentro dele, foca no input                
                if (field) {
                    activeFocus.field = field;
                    field = (field.querySelector('input') ||  field);
                    field.focus();
                    $timeout(function(){field.select();},200);
                }
            }
        }
    }];

}]);