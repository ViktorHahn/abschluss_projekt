// Direktive stammt von http://jsfiddle.net/Tentonaxe/V4axn/
// Autor: Tentonaxe
// Ermoeglicht Zwei-Wege-Datenbindung des html5-attr contenteditable
app.directive('contenteditable', function() {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function(scope, element, attrs, ngModel) {
            if(!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function() {
                element.html(ngModel.$viewValue || '');
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function() {
                scope.$apply(read);
            });

            // Write data to the model
            function read() {
                var html = element.text();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if( attrs.stripBr && html == '<br>' ) {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }

            // Ergaenzung von mir
            // ESC-Funktion fuer das Element
            element.bind('keydown', function(event){
                var esc = event.which == 27;
                var el = event.target;
                if(esc){
                    el.blur();
                }
            }); // Ergaenzung Ende
        }
    };
});
