// Direktive zum Austausch des Placeholders, wenn Location Lawyers
app.directive('searchPlaceholder', function($location, $routeParams){
    return{
        restrict : 'A',
        link: function(scope, element, attrs){
            if($location.path() == '/lawyers' ||
                $routeParams.lawyerName ||
                $routeParams.lawyerID
            ){
                console.log($location.path());
            }
            scope.$on('routeChangeSuccess', function(){
                console.log('jo');
                console.log($routeParams.lawyerID);
            })
        }
    }

});
