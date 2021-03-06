/**
 * Modul für die Benutzerfunktionalitäten der Anwendung.
 */
angular.module('brainworks.user', [])
/**
 * Regelt die Routen für das Benutzermodul
 * @param {Object} $stateProvider  Der Provider-Service zum Definieren von Routen/States
 */
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider) {
  $stateProvider
    .state('profile.settings', {
      url: '/settings',
      templateUrl: '/user/settings',
      controller: 'settingsCtrl',
      resolve: {
        /**
         * Lädt den Benutzerdaten für die Einstellungsverwaltung
         * @param {Object} localStorageService  Der Service zum Speichern und Laden von Informationen im Local-Storage
         * @param {Object} userSettingsFactory  Die Factory für die Einstellungen eines Benutzers
         */
        user: ['localStorageService', 'userSettingsFactory', function(localStorageService, userSettingsFactory) {
          return userSettingsFactory.loadUserData(localStorageService.get('userId'));
        }]
      }
    })
    .state('profile.logout', {
      url: '/user/signOut',
      /**
       * Controller für das Ausloggen des Bneutzers. Löscht aus dem Lokalstorage die gesicherten Daten.
       * das Token und die ID des Benutzers.
       * @param {Object} $rootScope  Der Root-Scope der Anwendung, welcher für alle anderen Scopes zugänglich ist
       * @param {Object} $state  Der State-Service zum Umleiten auf eine andere Seite
       * @param {Object} localStorageService  Der Service zum Speichern und Laden von Informationen im Local-Storage
       * @param {Object} userFactory  Die Factory für die Benutzerdaten
       */
      controller: ['$rootScope', '$state', 'localStorageService', 'userFactory', function($rootScope, $state, localStorageService, userFactory) {
        /**
         * Sendet an den Server eine Logout-Anfrage und leitet den Benutzer auf die Loginseite um.
         */
        userFactory.signOut(localStorageService.get('userId'), localStorageService.get('token')).success(function() {
          $rootScope.isAuthentificated = false;
          localStorageService.remove('token');
          localStorageService.remove('userId');
          $state.go('signIn');
        });
      }]
    });
}])
/**
 * Factory für die allgemienen Benutzerfunktionalitäten. Dient als
 * Schnittstelle zwischen dem Client und dem Server. Liefert Daten
 * und sendet Anfragen an den Server.
 * @param {Object} $http  Der HTTP-Service zum Senden von HTTP-Anfragen
 */
.factory('userFactory', ['$http', function($http) {
  return {
    /**
     * Ruft die URL zum Prüfen des Usernames auf
     * @param {string} username  Der Benutzername
     */
    checkUsername: function(username) {
      return $http.post('/user/check', {username: username});
    },
    /**
     * Ruft die URL zum Erstellen eines Users auf
     * @param {Object} user  Das JSON-Objekt mit den Benutzerinformationen.
     */
    createUser: function(user) {
      return $http.post('/user/signUp', {user: user});
    },
    /**
     * Ruft die URL zum Einloggen auf
     * @param {string} username  Der Benutzername
     * @param {string} password  Das Passwort
     */
    signIn: function(username, password) {
      return $http.post('/user/signIn', {username: username, password: password});
    },
    /**
     * Ruft die URL auf welche prüft, ob der User eingeloggt ist
     */
    checkLoggedIn: function() {
      return $http.get('/user/loggedIn');
    },
    /**
     * Ruft die URL zum Ausloggen auf
     * @param {string} userId  Die ID des Benutzers
     * @param {string} token  Der Token des eingeloggten Benutzers
     */
    signOut: function(userId, token) {
      return $http.post('/user/signOut', {userId: userId, token: token});
    }
  };
}]);