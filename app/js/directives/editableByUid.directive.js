// Direktive zum setzen des Atributs contenteditable,
// wenn der user ubereinstimmt oder admin ist
app.directive('editableByUid', function($compile){
    return {
        restrict : 'A',
        // Durchreichen des Grp scopes
        // Benoetigt zum Kompilieren und Ubergabe an Contenteditable-Direktive
        transclude: true,
        // Erstellen eines Isolierten Scopes mit Ubername der Param aus
        // HTML data-creator="{{grp.creatorID}}" und data-user="{{user.uid}}"
        scope : {
            user : '@',
            creator: '@'
        },

        link: function(scope, element, attrs){
            scope.$watch('creator', function(){
                // Anfrage ob creator existiert und creater gleich eingelogter user
                // oder Admin ist
                if(scope.creator.length >0 &&
                    (angular.equals(scope.creator,scope.user) || scope.$$nextSibling.user.credits == 2)
                ){
                    // Direktive entfernt ihr eigenes Attr
                    element.removeAttr('data-editable-by-uid');
                    // Entfernt ngTransclude da es nach der Enternung des eigenen Attr.
                    // ngTransclude findet sonst keine Direktive an die es den Scope weiterleiten kann und wirft
                    // Fehlermeldungen auf Konsole aus
                    element.removeAttr('data-ng-transclude');
                    // setzt Attr contenteditable und loestdamit die Direktive contenteditable aus
                    element.attr('contenteditable','');
                    // Kompilieren des Elements damit Angular weiss, dass ein neues Attr gesetzt ist
                    // scope.$$nextSibling ist der durchgereichte Scope z.b. Gruppe
                    var el = $compile(element)(scope.$$nextSibling);
                    return el;


                }
            })
        }
    }
});