/* global Firebase: false */
(function($, Firebase) {
    'use strict';

    window.WPM = window.WPM || {};

    window.WPM.LoginBox = function(login) {
        var that = this;

        var firebase = new Firebase(window.WPM.firebaseURL);
        var user;

        function djb2(str){
            var hash = 5381;
            for (var i = 0; i < str.length; i++) {
                hash = (hash << 5) + hash + str.charCodeAt(i);
            }
            return hash;
        }

        function hashToName(str) {
            return 'Guest' + djb2(str).toString(10).substr(-5);
        }

        firebase.onAuth(function(authData) {
            user = authData;

            if (user && user.provider === 'anonymous') {
                user.displayName = hashToName(user.uid);
            } else if (user && user.provider === 'google') {
                user.displayName = user.google.displayName;
            }

            var userRef = firebase.child('presence').child(user.uid);
            userRef.onDisconnect().remove();
            userRef.set(true);

            afterAuth();

            $(that).trigger({
                type: 'userchange.wpm',
                user: {
                    uid: user.uid,
                    displayName: user.displayName,
                },
            });
        });

        firebase.offAuth(function() {
            firebase.child('presence').child(user.uid).remove();
        });

        function afterAuth() {
            var showLogin = false;
            var showLogout = false;

            if (!user) {
                login.find('.status').text('Not logged in');
                showLogin = true;
            } else if (user.provider === 'anonymous') {
                login.find('.status').text(user.displayName);
                showLogin = true;
            } else {
                login.find('.status').text(user.displayName);
                showLogout = true;
            }

            login.find('.links').html('');

            if (showLogin) {
                $('<a href="#">Login</a>')
                    .on('click', function () {
                        firebase.authWithOAuthPopup('google', function() {});

                        return false;
                    })
                    .appendTo(login.find('.links'));
            }

            if (showLogout) {
                $('<a href="#">Logout</a>')
                    .on('click', function () {
                        firebase.unauth(function() {});
                        firebase.authAnonymously(function() {});

                        return false;
                    })
                    .appendTo(login.find('.links'));
            }
        }

        if (!firebase.getAuth()) {
            firebase.authAnonymously(function() {});
        }
    };
})($, Firebase);
