/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global _ */

var x2js = new X2JS();

var Main = angular.module('app', [
    'ngRoute'
]);

Main.directive('bufferedScroll', function ($parse) {
    return function ($scope, element, attrs) {
        var handler = $parse(attrs.bufferedScroll);
        angular.element(document.querySelector('.viewport')).bind("scroll", function (evt) {
            var scrollTop = angular.element(document.querySelector('.viewport'))[0].scrollTop;
            var scrollHeight = angular.element(document.querySelector('.viewport'))[0].scrollHeight;
            var offsetHeight = angular.element(document.querySelector('.viewport'))[0].offsetHeight;
            if (scrollTop === (scrollHeight - offsetHeight)) {
                $scope.$apply(function () {
                    handler($scope);
                });
            }
        });
    };
});


Main.controller('AppController', ['$scope', "$http", "$rootScope", "$route",
    function ($scope, $http, $rootScope, $route) {
        $scope.sameContactCount = 0;
        $scope.mergeContactCount = 0;
        $scope.mergeContact = [];
        $scope.disableSameContact = [];
        $scope.dirtyContactList = [];
        $scope.importCleanContactList = [];
        $scope.compareContactList = [];
        $scope.importAddPhoneContactList = [];
        $scope.addPhoneContactArray = [];
        $scope.newSingleAddContact = {};
        $scope.sortType = 'name';
        $scope.contactList = [];
        $scope.editContactObj = {};
        $scope.removedPhones = [];
        $scope.singleAddPhone = "";

        $scope.increaseLimit = function () {
            $scope.limit += 50;
        };

        $scope.importFile = function (xmlText) {
            $scope.dirtyContactList = x2js.xml_str2json(xmlText).contacts.contact;
            $scope.disableSameContact = _.uniq($scope.dirtyContactList, function (item) {
                return [item.name, item.lastName, item.phone].sort().join(',');
            });

            $scope.controlContactArray = _.filter($scope.disableSameContact, function (obj) {
                return !_.findWhere($scope.compareContactList, obj);
            });

            $scope.addPhoneContactArray = intersectionObjects($scope.controlContactArray, $scope.compareContactList, function (item1, item2) {
                return item1.name === item2.name && item1.lastName === item2.lastName;
            });

            $scope.controlContactArray = _.filter($scope.controlContactArray, function (obj) {
                return !_.findWhere($scope.addPhoneContactArray, obj);
            });

            var groups = _.groupBy($scope.controlContactArray, function (value) {
                return value.name + '#' + value.lastName;
            });

            $scope.mergeContact = _.map(groups, function (group) {
                return {
                    name: group[0].name,
                    lastName: group[0].lastName,
                    phones: _.pluck(group, 'phone')
                };
            });
            $scope.sameContactCount = $scope.dirtyContactList.length - $scope.disableSameContact.length;
            $scope.mergeContactCount = $scope.disableSameContact.length - $scope.mergeContact.length;
            $scope.importCleanContactList = $scope.mergeContact;
            var i, len = $scope.addPhoneContactArray.length;
            for (i = 0; i < len; i++) {
                $scope.addPhoneContactArray[i]['phones'] = [$scope.addPhoneContactArray[i]['phone']];
                delete $scope.addPhoneContactArray[i]['phone'];
            }
            $scope.importAddPhoneContactList = $scope.addPhoneContactArray;
            $scope.$apply();
        };

        $scope.importSave = function (contacts) {
            if (contacts.length > 0 || $scope.importAddPhoneContactList.length > 0) {
                if (contacts.length > 0) {
                    $http.post("/api/contact/saveContacts", contacts)
                            .then(function (response) {
                                $scope.getAllContacts();
                                $scope.resetFile();
                                alert(contacts.length + " contact(s) saved.");
                                $scope.importCleanContactList = [];
                            }, function (response) {
                                alert("failure");
                            });
                }
                if ($scope.importAddPhoneContactList.length > 0) {
                    $http.post("/api/contact/addPhoneContact", $scope.importAddPhoneContactList)
                            .then(function (response) {
                                $scope.getAllContacts();
                                alert($scope.importAddPhoneContactList.length + " contact(s) updated.");
                                $scope.importAddPhoneContactList = [];
                                $('#importContact').modal('hide');
                            }, function (response) {
                                alert("failure");
                            });
                }
                $scope.resetFile();
            } else {

            }

        };

        $scope.resetFile = function () {
            var $el = $('#getFile');
            $el.wrap('<form>').closest('form').get(0).reset();
            $el.unwrap();
            $scope.resetCounts();
            $('#getFileName').val('');
            $('#importContact').modal('hide');
        };

        $scope.getAllContacts = function () {
            $scope.compareContactList = [];
            $http.get("/api/contact/getAllContacts")
                    .then(function (response) {
                        $scope.contactList = response.data;
                        _.map($scope.contactList, function (item) {
                            var temp = [];
                            _.map(item.phones, function (x) {
                                $scope.compareContactList.push({name: item.name, lastName: item.lastName, phone: x});
                            });
                        });
                    }, function (response) {
                        alert("failure");
                    });
        };

        $scope.deleteContact = function (indexContact) {
            if (confirm("Are you sure?")) {
                $http.post("/api/contact/deleteContact", indexContact)
                        .then(function (response) {
                            $scope.getAllContacts();
                            $scope.resetCounts();
                            alert(indexContact.name + " " + indexContact.lastName + " Contact Deleted.");
                        }, function (response) {
                            alert("failure delete");
                        });
            }
        };

        $scope.deleteAllContact = function () {
            if (confirm("Are you sure?")) {
                $http.post("/api/contact/deleteAllContacts", $scope.importAddPhoneContactList)
                        .then(function (response) {
                            $scope.getAllContacts();
                            $scope.resetCounts();
                            $scope.compareContactList = [];
                            alert("All Contacts Deleted");
                        }, function (response) {
                            alert("failure delete");
                        });
            }
        };

        $scope.addContact = function (contact) {
            contact.phones = [contact.phones];
            $http.post("/api/contact/saveContact", contact)
                    .then(function (response) {
                        if (response.data === "OK") {
                            $scope.getAllContacts();
                            $scope.newSingleAddContact = {};
                            $scope.contactList = [];
                            alert(contact.name + " " + contact.lastName + " " + contact.phones + " Contact Saved !");
                        } else {
                            $scope.newSingleAddContact = {};
                            alert("This person has this phone number.");
                        }
                    }, function (response) {
                        alert("failure saved");
                    });
        };

        $scope.editContact = function (obj) {
            $scope.editContactObj = $scope.getContact(obj.id);
            $scope.backupContact = obj;
        };

        $scope.editContactSave = function () {
            if ($scope.editContactObj.phones.length > 0) {
                $http.post("/api/contact/updateContact", $scope.editContactObj)
                        .then(function (response) {
                            if (response.data === "OK") {
                                $scope.getAllContacts();
                                $scope.removedPhones = [];
                                alert($scope.editContactObj.name + " " + $scope.editContactObj.lastName + " " + $scope.editContactObj.phones + " Contact Updated !");
                            } else {
                                alert("Copy contact found, failure updated.");
                            }
                        }, function (response) {
                            alert("failure updated");
                        });
            } else {
                alert("Phone number not found in Contact.")
            }
        };

        $scope.getContact = function (id) {
            $http.post("/api/contact/getContact", id)
                    .then(function (response) {
                        $scope.editContactObj = response.data;
                    }, function (response) {
                        alert("failure");
                    });
        };

        $scope.editPhone = function (phone) {
            $scope.singleAddPhone = phone;
            $scope.editContactObj.phones = _.reject($scope.editContactObj.phones, function (el) {
                return el === phone;
            });
        };

        $scope.addNewPhone = function (phone) {
            if (phone === "") {
                alert("Phone required.");
            } else {
                if (!_.contains($scope.editContactObj.phones, phone)) {
                    $scope.editContactObj.phones.push(phone);
                    $scope.singleAddPhone = "";
                } else {
                    alert("Duplicate Phone Number");
                }
            }
        };

        $scope.removePhone = function (obj) {
            $scope.editContactObj.phones = _.reject($scope.editContactObj.phones, function (el) {
                return el === obj;
            });

            $scope.removedPhones.push(obj);
        };

        $scope.exportContacts = function () {
            if (confirm("Are you sure?")) {
                $http.get("/api/contact/getAllContacts")
                        .then(function (response) {
                            if (response.data.length > 0) {
                                $scope.exportContactList = [];
                                $scope.responseData = _.map(response.data, function (o) {
                                    return _.omit(o, 'id');
                                });
                                _.map($scope.responseData, function (item) {
                                    var temp = [];
                                    _.map(item.phones, function (x) {
                                        $scope.exportContactList.push({name: item.name, lastName: item.lastName, phone: x});
                                    });
                                });
                                $scope.contacts = {
                                    contacts: {
                                        contact: $scope.exportContactList
                                    }
                                };
                                $scope.exportXml = x2js.json2xml_str($scope.contacts);
                                $scope.exportXml = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>" + $scope.exportXml;
                                var hiddenElement = document.createElement('a');
                                hiddenElement.href = 'data:attachment/text,' + encodeURI($scope.exportXml);
                                hiddenElement.target = '_blank';
                                hiddenElement.download = 'myContacts.xml';
                                hiddenElement.click();
                            } else {
                                alert('Not found contacts.')
                            }

                        }, function (response) {
                            alert("failure");
                        });
            }
        };

        $scope.resetCounts = function () {
            $scope.sameContactCount = 0;
            $scope.mergeContactCount = 0;
            $scope.mergeContact = [];
            $scope.disableSameContact = [];
            $scope.dirtyContactList = [];
            $scope.addPhoneContactArray = [];
        };
    }
]);


// Input File
$(function () {
    $(document).on('change', ':file', function () {
        var input = $(this),
                numFiles = input.get(0).files ? input.get(0).files.length : 1,
                label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);
    });

    $(document).ready(function () {
        $(':file').on('fileselect', function (event, numFiles, label) {

            var input = $(this).parents('.input-group').find(':text'),
                    log = numFiles > 1 ? numFiles + ' files selected' : label;

            if (input.length) {
                input.val(log);
            } else {
                if (log)
                    alert(log);
            }

            var fileImport = $('#getFile')[0].files[0];
            loadData(fileImport);
        });
    });

});

//  Load input File
function loadData(fileInput) {
    angular.element(document.getElementById('contactList')).scope().resetCounts();
    angular.element(document.getElementById('contactList')).scope().importCleanContactList = [];
    angular.element(document.getElementById('contactList')).scope().importAddPhoneContactList = [];
    var file = fileInput;
    var fileURL = URL.createObjectURL(file);
    var req = new XMLHttpRequest();
    req.open('GET', fileURL);
    req.onload = function () {
        URL.revokeObjectURL(fileURL);
        var xmlText = new XMLSerializer().serializeToString(this.responseXML.documentElement);
        angular.element(document.getElementById('contactList')).scope().importFile(xmlText);
    };
    req.onerror = function () {
        URL.revokeObjectURL(fileURL);
        console.log('Error loading XML file.');
    };
    req.send();
}

function intersectionObjects2(a, b, areEqualFunction) {
    var results = [];

    for (var i = 0; i < a.length; i++) {
        var aElement = a[i];
        var existsInB = _.any(b, function (bElement) {
            return areEqualFunction(bElement, aElement);
        });

        if (existsInB) {
            results.push(aElement);
        }
    }

    return results;
}

function intersectionObjects() {
    var results = arguments[0];
    var lastArgument = arguments[arguments.length - 1];
    var arrayCount = arguments.length;
    var areEqualFunction = _.isEqual;

    if (typeof lastArgument === "function") {
        areEqualFunction = lastArgument;
        arrayCount--;
    }

    for (var i = 1; i < arrayCount; i++) {
        var array = arguments[i];
        results = intersectionObjects2(results, array, areEqualFunction);
        if (results.length === 0)
            break;
    }

    return results;
}

