angular.module('mainController', ['authServices', 'userServices'])

    .controller('mainCtrl', function (Auth, $location, $timeout, $rootScope, $window, $interval, $route, User, AuthToken) {
        var app = this;

        app.loadMe = false;

        app.checkSession = function () {
            if (Auth.isLoggedIn()) {
                app.checkingSession = true;
                var interval = $interval(function () {
                    var token = $window.localStorage.getItem('token');
                    if (token === null) {
                        $interval.cancel(interval);
                    }
                    else {
                        self.parseJwt = function (token) {
                            var base64Url = token.split('.')[1];
                            var base64 = base64Url.replace('-', '+').replace('_', '/');
                            return JSON.parse($window.atob(base64));
                        }
                        var expireTime = self.parseJwt(token);
                        var timeStamp = Math.floor(Date.now() / 1000);
                        var timeCheck = expireTime.exp - timeStamp;
                        if (timeCheck <= 1800) {
                            showModal(1);
                            $interval.cancel(interval);
                        }
                        else {

                        }
                    }

                }, 2000);
            }
        }

        app.checkSession();

        var showModal = function (option) {
            app.choiceMade = false;
            app.modalHeader = undefined;
            app.modalBody = undefined;
            app.hideButton = false;
            if (option === 1) {
                app.modalHeader = 'Timeout Warning';
                app.modalBody = 'Your session will expired in 30 minutes. Would you like to renew your session?';
                $("#myModal").modal({ backdrop: "static" });
            }
            else if (option === 2) {
                app.hideButton = true;
                app.modalHeader = 'Logging Out';
                $("#myModal").modal({ backdrop: "static" });
                $timeout(function () {
                    Auth.logout();
                    $location.path('/logout');
                    hideModal();
                    $route.reload();
                }, 2000);
            }
            $timeout(function () {
                if (!app.choiceMade) {
                    hideModal();
                }
            }, 4000);
        }

        app.renewSession = function () {
            app.choiceMade = true;
            console.log('session has been renewed');
            User.renewSession(app.username).then(function (data) {
                if (data.data.success) {
                    AuthToken.setToken(data.data.token);
                    app.checkSession();
                } else {
                    app.modalBody = data.data.message;
                }
            });
            hideModal();
        }

        app.endSession = function () {
            app.choiceMade = true;
            console.log('session has ended');
            hideModal();
            $timeout(function () {
                showModal(2); // logout user
            }, 1000);
        }

        var hideModal = function () {
            $("#myModal").modal('hide');
        };

        //Check the status everytime a route changes (auto refresh the browser)
        $rootScope.$on('$routeChangeStart', function () {
            if (!app.checkingSession) app.checkSession();
            if (Auth.isLoggedIn()) {
                app.isLoggedIn = true;
                Auth.getUser().then(function (data) {
                    app.username = data.data.username;
                    app.useremail = data.data.email;
                    User.getPermission().then(function (data) {
                        if (data.data.permission === 'admin' || data.data.permission === 'moderator') {
                            app.authorized = true;
                            app.loadMe = true;
                        } else {
                            app.loadMe = true;
                        }
                    });
                });
            }
            else {
                app.isLoggedIn = false;
                app.username = '';
                app.loadMe = true;
            }
        });

        this.doLogin = function (loginData) {
            app.loading = true;
            app.errorMsg = false;
            app.expired = false;
            app.disabled = true;

            Auth.login(app.loginData).then(function (data) {
                if (data.data.success) {
                    app.loading = false;
                    app.successMsg = data.data.message + '...Redirecting'; //create success message
                    $timeout(function () { // this is for setting a timeout of 2 seconds before the redirect
                        $location.path('/about'); // this redirects to the home page after a successful save. Make sure to define $location in the function above
                        app.loginData = '';
                        app.successMsg = false;
                        app.checkSession();
                    }, 2000);
                }
                else {
                    if (data.data.expired) {
                        app.expired = true;
                        app.loading = false;
                        app.errorMsg = data.data.message; //create error message
                    }
                    else {
                        app.loading = false;
                        app.disabled = false;
                        app.errorMsg = data.data.message; //create error message
                    }
                }
            });
        }

        app.logout = function () {
            showModal(2);
        }
    });
