// Direktive zum Austausch des Placeholders, wenn Location Lawyer*
app.directive('searchPlaceholder', function($location, $compile){
    return{
        restrict : 'A',
        link: function(scope, element, attrs){
            scope.$on('$routeChangeSuccess', function () {
                // RegEx um den LocationHash /lawyer* zu testen
                var lawyerLocation = /^\/lawyer.*/;
                // Placeholdertext fuer die Suche nach Anwaetlten
                var lawyerPlaceholder = 'Stadt oder Name...';
                var groupPlaceholder = 'Stadt oder Gegner...';

                // Ist Location Lawyer* und hat das Element das Attr Placeholder?
                if(lawyerLocation.test($location.path() /*&& attrs.hasOwnProperty('placeholder')*/)
                ){
                    element.attr('placeholder', lawyerPlaceholder);
                }
                // Wenn nicht Location Lawyer*, Pruefe ob der aktuelle Placeholder dem groupPlaceholder
                // entspricht. Wenn nicht setze groupPlaceholder.
                else {
                    element.attr('placeholder', function(){
                        if(attrs.placeholder != groupPlaceholder){
                            element.attr('placeholder', groupPlaceholder);
                        }
                    });
                }
                // Kompilieren des Elements damit Angular weiss, dass ein neues Attr gesetzt ist
                var el = $compile(element)(scope);
                return el;
            });

        }
    }

});
