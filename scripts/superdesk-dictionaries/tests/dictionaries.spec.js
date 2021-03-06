
describe('dictionaries', function() {
    'use strict';

    var USER_ID = 'foo',
        LANG = 'en';

    beforeEach(module('superdesk.dictionaries'));
    beforeEach(module('superdesk.templates-cache'));

    beforeEach(inject(function(session, $q) {
        spyOn(session, 'getIdentity').and.returnValue($q.when({_id: USER_ID}));
    }));

    it('can fetch global dictionaries', inject(function(api, dictionaries, $q, $rootScope) {
        spyOn(api, 'query').and.returnValue($q.when());
        dictionaries.fetch();
        $rootScope.$digest();
        expect(api.query).toHaveBeenCalledWith('dictionaries', {projection: {content: 0}, where: {
            $or: [
                  {user: {$exists: false}},
                  {user: 'foo'}
              ]}});
    }));

    it('can get dictionaries for given language', inject(function(api, dictionaries, $q, $rootScope) {
        spyOn(api, 'query').and.returnValue($q.when({_items: [{_id: 1}]}));
        spyOn(api, 'find').and.returnValue($q.when({}));

        var items;
        dictionaries.getActive(LANG).then(function(_items) {
            items = _items;
        });

        $rootScope.$digest();

        expect(items.length).toBe(1);
        expect(api.query).toHaveBeenCalledWith('dictionaries', {
            projection: {content: 0},
            where: {$and:
                [{$or: [{language_id: LANG}]},
                {is_active: {$in: ['true', null]}},
                {$or: [{type: {$exists: 0}}, {type: 'dictionary'}]},
                {$or: [{user: USER_ID}, {user: {$exists: false}}]}]
            }
        });
        expect(api.find).toHaveBeenCalledWith('dictionaries', 1);
    }));

    it('can get dictionaries for given language and the base language',
        inject(function(api, dictionaries, $q, $rootScope) {
        spyOn(api, 'query').and.returnValue($q.when({_items: [{_id: 1}]}));
        spyOn(api, 'find').and.returnValue($q.when({}));

        var items;
        dictionaries.getActive('en-US', 'en').then(function(_items) {
            items = _items;
        });

        $rootScope.$digest();

        expect(items.length).toBe(1);
        expect(api.query).toHaveBeenCalledWith('dictionaries', {
            projection: {content: 0},
            where: {$and:
                [{$or: [{language_id: 'en-US'}, {language_id: 'en'}]},
                {is_active: {$in: ['true', null]}},
                {$or: [{type: {$exists: 0}}, {type: 'dictionary'}]},
                {$or: [{user: USER_ID}, {user: {$exists: false}}]}]
            }
        });
        expect(api.find).toHaveBeenCalledWith('dictionaries', 1);
    }));

    it('can get and update user dictionary', inject(function(api, dictionaries, $q, $rootScope) {
        var userDict = {};
        spyOn(api, 'query').and.returnValue($q.when({_items: [userDict]}));
        dictionaries.getUserDictionary(LANG);
        $rootScope.$digest();
        var where = {
            where: {
                $and: [
                    {language_id: 'en'}, {user: 'foo'},
                    {$or: [{type: {$exists: 0}}, {type: 'dictionary'}]}
                ]
            }
        };
        expect(api.query).toHaveBeenCalledWith('dictionaries', where);
    }));

    it('can create dict when adding word', inject(function(dictionaries, api, $q, $rootScope) {
        spyOn(api, 'query').and.returnValue($q.when({_items: []}));
        spyOn(api, 'save').and.returnValue($q.when());

        dictionaries.addWordToUserDictionary('test', LANG);
        $rootScope.$digest();

        expect(api.save).toHaveBeenCalledWith('dictionaries', {
            language_id: LANG,
            content: {test: 1},
            user: USER_ID,
            name: USER_ID + ':' + LANG
        });
    }));

    describe('config modal directive', function() {
        var scope;

        beforeEach(inject(function($rootScope, $controller) {
            scope = $rootScope.$new();
            scope.dictionary = {content: {foo: 1, bar: 1}};
            $controller('DictionaryEdit', {$scope: scope});
        }));

        it('can search words', function() {
            scope.filterWords('test');
            expect(scope.isNew).toBe(true);
            expect(scope.wordsCount).toBe(2);
        });

        it('can prevent addition of existing word case-sensitively in dictionary', function() {
            scope.filterWords('foo');
            expect(scope.isNew).toBe(false);
            expect(scope.wordsCount).toBe(2);
            scope.filterWords('Foo');
            expect(scope.isNew).toBe(true);
            expect(scope.wordsCount).toBe(2);
        });

        it('can add words', function() {
            scope.addWord('test');
            expect(scope.dictionary.content.test).toBe(1);
            expect(scope.words.length).toBe(1);
            expect(scope.wordsCount).toBe(3);
        });

        it('can remove words', function() {
            scope.filterWords('foo');
            expect(scope.isNew).toBe(false);
            expect(scope.words.length).toBe(1);
            expect(scope.words[0]).toBe('foo');

            scope.removeWord('foo', 'foo');
            expect(scope.isNew).toBe(true);
            expect(scope.words.length).toBe(0);
            expect(scope.wordsCount).toBe(1);
        });
    });
});
