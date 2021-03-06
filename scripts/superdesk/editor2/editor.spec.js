'use strict';

describe('text editor', function() {

    beforeEach(module(function($provide) {
        $provide.constant('config', {server: {url: undefined}, iframely: {key: '123'}});
    }));

    beforeEach(module('superdesk.publish'));
    beforeEach(module('superdesk.config'));
    beforeEach(module('superdesk.editor2'));
    beforeEach(module('superdesk.editor.spellcheck'));

    beforeEach(function() {
        // remove all elements from body
        document.body = document.createElement('body');
    });

    function createScope(text, $rootScope) {
        var scope = $rootScope.$new();
        scope.node = document.createElement('p');
        scope.node.innerHTML = text;
        scope.model = {
            $viewValue: text,
            $setViewValue: function(value) {
                this.$viewValue = value;
            }
        };
        scope.medium = {
            exportSelection: function() {
                return {start: 0, end: 0};
            },
            importSelection: function(pos) {
                return;
            }
        };
        document.body.appendChild(scope.node);
        spyOn(scope.model, '$setViewValue').and.callThrough();
        return scope;
    }

    it('can spellcheck', inject(function(editor, spellcheck, $q, $rootScope) {
        spyOn(spellcheck, 'errors').and.returnValue($q.when([{word: 'test', index: 0}]));
        var scope = createScope('test', $rootScope);
        editor.registerScope(scope);
        editor.renderScope(scope);
        $rootScope.$digest();

        expect(scope.node.innerHTML).toBe('test');
        expect(scope.node.parentNode.lastChild.innerHTML)
            .toBe('<span class="sderror sdhilite" data-word="test" data-index="0">test</span>');
    }));

    it('can replace word in node', inject(function(editor, $q, $rootScope) {
        var content = 'test <b>foo</b>';
        var scope = createScope(content, $rootScope);
        editor.replaceWord(scope, 5, 3, 'bars');
        expect(scope.node.innerHTML).toBe('test <b>bars</b>');
    }));

    it('can findreplace', inject(function(editor, spellcheck, $q, $rootScope) {
        spyOn(spellcheck, 'errors').and.returnValue($q.when([{word: 'test', index: 0}]));
        var scope = createScope('test foo and foo', $rootScope);
        editor.registerScope(scope);

        editor.setSettings({findreplace: {diff: {foo: '', bar: ''}}});
        editor.render();
        $rootScope.$digest();

        var foo1 = '<span class="sdfindreplace sdhilite" data-word="foo" data-index="5">foo</span>';
        var foo1active = '<span class="sdfindreplace sdhilite sdactive" data-word="foo" data-index="5">foo</span>';
        var foo2 = '<span class="sdfindreplace sdhilite" data-word="foo" data-index="13">foo</span>';
        var foo2active = '<span class="sdfindreplace sdhilite sdactive" data-word="foo" data-index="13">foo</span>';

        expect(scope.node.innerHTML).toBe('test foo and foo');
        expect(scope.node.parentNode.lastChild.innerHTML).toBe('test ' + foo1active + ' and ' + foo2);

        editor.selectNext();
        expect(scope.node.innerHTML).toBe('test foo and foo');
        expect(scope.node.parentNode.lastChild.innerHTML).toBe('test ' + foo1 + ' and ' + foo2active);

        editor.selectPrev();
        expect(scope.node.parentNode.lastChild.innerHTML).toBe('test ' + foo1active + ' and ' + foo2);

        editor.replace('tic');
        $rootScope.$digest();
        expect(scope.node.innerHTML).toBe('test tic and foo');
        editor.render();
        $rootScope.$digest();
        expect(scope.node.parentNode.lastChild.innerHTML).toBe('test tic and ' + foo2active);

        editor.setSettings({findreplace: {diff: {test: ''}}});
        editor.render();
        $rootScope.$digest();
        editor.replaceAll('bars');
        expect(scope.node.innerHTML).toBe('bars tic and foo');

        editor.setSettings({findreplace: null});
        editor.render();
        $rootScope.$digest();
        expect(scope.node.parentNode.lastChild.innerHTML).toContain('sderror');
        expect(scope.node.parentNode.lastChild.innerHTML).not.toContain('active');
        expect(scope.node.innerHTML).toBe('bars tic and foo');
    }));

    it('can replace abbreviations', inject(function(editor, spellcheck, $q, $rootScope, $timeout) {
        editor.setSettings({spellcheck: true});
        var abbreviations = {
            IMF: 'International Monetory Fund',
            WHO: 'World Health Organisation',
            UN: 'United Nations'
        };
        spyOn(spellcheck, 'getAbbreviationsDict').and.returnValue($q.when(abbreviations));
        var scope = createScope('test', $rootScope);
        editor.registerScope(scope);
        scope.node.parentNode.classList.add('typing');
        scope.node.innerHTML = 'foo';
        editor.commit();
        expect(scope.model.$setViewValue).not.toHaveBeenCalled();
        $rootScope.$digest();
        expect(scope.model.$setViewValue).toHaveBeenCalledWith('foo');
        expect(scope.node.innerHTML).toBe('foo');

        scope.node.innerHTML = 'foo IMF*';
        editor.commit();
        $rootScope.$digest();
        expect(scope.node.innerHTML).toBe('foo ' + abbreviations.IMF);

        scope.node.innerHTML = 'foo IMF IMF* IMF*';
        editor.commit();
        $rootScope.$digest();
        expect(scope.node.innerHTML).toBe('foo IMF ' + abbreviations.IMF + ' ' + abbreviations.IMF);

        scope.node.innerHTML = 'foo IMF* WHO*';
        editor.commit();
        $rootScope.$digest();
        expect(scope.node.innerHTML).toBe('foo ' + abbreviations.IMF + ' ' + abbreviations.WHO);

    }));

    it('can save model value', inject(function(editor, $rootScope) {
        var scope = createScope('foo', $rootScope);
        editor.registerScope(scope);

        scope.node.innerHTML = 'foo';
        editor.commit();
        expect(scope.model.$setViewValue).not.toHaveBeenCalled();

        scope.node.innerHTML = 'bar';
        editor.commit();
        $rootScope.$digest();
        expect(scope.model.$setViewValue).toHaveBeenCalledWith('bar');

        scope.node.innerHTML = 'baz';
        editor.commit();
        $rootScope.$digest();
        editor.undo(scope);
        editor.undo(scope);
        expect(scope.node.innerHTML).toBe('foo');

        editor.redo(scope);
        expect(scope.node.innerHTML).toBe('bar');

        editor.redo(scope);
        expect(scope.node.innerHTML).toBe('baz');

        editor.undo(scope);
        editor.undo(scope);

        scope.node.innerHTML = 'test';
        editor.commit();
        $rootScope.$digest();
        editor.redo(scope);
        expect(scope.node.innerHTML).toBe('test');
    }));

    it('can check if keyboard event is important or not', inject(function(editor) {
        expect(editor.shouldIgnore({keyCode: 16})).toBe(true);
        expect(editor.shouldIgnore({shiftKey: true, ctrlKey: true, keyCode: 65})).toBe(true);
        expect(editor.shouldIgnore({keyCode: 65})).toBe(false);
    }));
});
