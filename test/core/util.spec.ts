import { addClass, escapeHtml as escape, removeClass, disableSelection, H, spacerDiv } from "@/core/util";

describe('addClass', () => {
    it('should not do anything if classes to add is null or undefined', () => {
        const element: HTMLDivElement = document.createElement('div');

        addClass(element, null);
        addClass(element, undefined);

        expect(element.classList.length).toBe(0);
    });

    it('should add class to the element', () => {
        const element: HTMLDivElement = document.createElement('div');

        addClass(element, 'test');

        expect(element.classList.length).toBe(1);
        expect(element.classList.contains('test')).toBe(true);
    });

    it('should add multiple classes to the element', () => {
        const element: HTMLDivElement = document.createElement('div');

        addClass(element, 'test1 test2');

        expect(element.classList.length).toBe(2);
        expect(element.classList.contains('test1')).toBe(true);
        expect(element.classList.contains('test2')).toBe(true);
    });

    it('should not add duplicate classes to the element', () => {
        const element: HTMLDivElement = document.createElement('div');

        addClass(element, 'test');
        addClass(element, 'test');

        expect(element.classList.length).toBe(1);
        expect(element.classList.contains('test')).toBe(true);
    });

    it('should not add empty space if parameter contains more than one space', () => {
        const element: HTMLDivElement = document.createElement('div');

        addClass(element, 'test1  test2');

        expect(element.classList.length).toBe(2);
        expect(element.classList.contains('test1')).toBe(true);
        expect(element.classList.contains('test2')).toBe(true);
    });
});

describe('removeClass', () => {
    it('should not do anything if classes to remove is null or undefined', () => {
        const element: HTMLDivElement = document.createElement('div');
        element.classList.add('test');

        removeClass(element, null);
        removeClass(element, undefined);

        expect(element.classList.length).toBe(1);
        expect(element.classList.contains('test')).toBe(true);
    });

    it('should remove class from the element', () => {
        const element: HTMLDivElement = document.createElement('div');
        element.classList.add('test');

        expect(element.classList.length).toBe(1);

        removeClass(element, 'test');

        expect(element.classList.length).toBe(0);
        expect(element.classList.contains('test')).toBe(false);
    });

    it('should remove multiple classes from the element', () => {
        const element: HTMLDivElement = document.createElement('div');
        element.classList.add('test1');
        element.classList.add('test2');

        expect(element.classList.length).toBe(2);

        removeClass(element, 'test1 test2');

        expect(element.classList.length).toBe(0);
        expect(element.classList.contains('test1')).toBe(false);
        expect(element.classList.contains('test2')).toBe(false);
    });
});

describe('H', () => {
    it('should create a div element', () => {
        const element: HTMLDivElement = H('div');

        expect(element.tagName).toBe('DIV');
    });

    it('should create a div element with class', () => {
        const element: HTMLDivElement = H('div', { class: 'test' });

        expect(element.tagName).toBe('DIV');
        expect(element.classList.contains('test')).toBe(true);
    });

    it('should create a div element with id', () => {
        const element: HTMLDivElement = H('div', { id: 'test' });

        expect(element.tagName).toBe('DIV');
        expect(element.id).toBe('test');
    });

    it('should create a div element with id and class', () => {
        const element: HTMLDivElement = H('div', { id: 'test', class: 'test' });

        expect(element.tagName).toBe('DIV');
        expect(element.id).toBe('test');
        expect(element.classList.contains('test')).toBe(true);
    });

    it('should create a div element with id, class and attributes', () => {
        const element: HTMLDivElement = H('div', { id: 'test', class: 'test', 'data-test': 'test' });

        expect(element.tagName).toBe('DIV');
        expect(element.id).toBe('test');
        expect(element.classList.contains('test')).toBe(true);
        expect(element.getAttribute('data-test')).toBe('test');
    });

    it('should create a div with children', () => {
        const element: HTMLDivElement = H('div', {}, H('span'));

        expect(element.tagName).toBe('DIV');
        expect(element.childElementCount).toBe(1);
        expect(element.children[0].tagName).toBe('SPAN');
    });

    it('should create a div with children and attributes', () => {
        const element: HTMLDivElement = H('div', { 'data-test': 'test' }, H('span'));

        expect(element.tagName).toBe('DIV');
        expect(element.childElementCount).toBe(1);
        expect(element.children[0].tagName).toBe('SPAN');
        expect(element.getAttribute('data-test')).toBe('test');
    });

    it('should create a div with children which have attributes and classes and id', () => {
        const element: HTMLDivElement = H('div', { 'data-test': 'test' }, H('span', { class: 'test', id: 'test' }));

        expect(element.tagName).toBe('DIV');
        expect(element.getAttribute('data-test')).toBe('test');
        expect(element.childElementCount).toBe(1);
        expect(element.children[0].tagName).toBe('SPAN');
        expect(element.children[0].classList.contains('test')).toBe(true);
        expect(element.children[0].id).toBe('test');
    });

    it('should leave attribute value empty on div if value is true', () => {
        const element: HTMLDivElement = H('div', { 'data-test': true });

        expect(element.getAttribute('data-test')).toBe('');
    });

    it('should not add attribute if value is false', () => {
        const element: HTMLDivElement = H('div', { 'data-test': false });

        expect(element.hasAttribute('data-test')).toBe(false);
    });

    it('should not add attribute if value is null', () => {
        const element: HTMLDivElement = H('div', { 'data-test': null });

        expect(element.hasAttribute('data-test')).toBe(false);
    });

    it('should call ref method with the element reference', () => {
        var divRef: HTMLSpanElement;
        var spanRef: HTMLSpanElement;
        var element = H('div', { ref: el => divRef = el }, 
            H('span', { ref: el => spanRef = el }));
        expect(divRef).toBeDefined();
        expect(divRef === element).toBe(true);
        expect(spanRef).toBeDefined();
        expect(spanRef.tagName).toBe('SPAN');
    });

    it('converts className attribute to class', () => {
        var element = H('div', { className: 'test' });
        expect(element).toBeDefined();
        expect(element.className).toBe('test');
    });

    it('can set className property via class', () => {
        var element = H('div', { class: 'test' });
        expect(element).toBeDefined();
        expect(element.className).toBe('test');
    });

});

describe('spacerDiv', () => {
    it('returns a div element', () => {
        const div = spacerDiv("1px");

        expect(div.tagName).toBe('DIV');
    });

    it('sets the width of the div', () => {
        const div = spacerDiv("100px");

        expect(div.getAttribute('width')).toBe('100px');
    });
});

describe('disableSelection', () => {
    it('should not do anything if element is null or undefined', () => {
        disableSelection(null);
        disableSelection(undefined);
    });

    it('should disable selection on the element', () => {
        const element: HTMLDivElement = document.createElement('div');
        var func: Function;
        element.addEventListener = (_: any, listener: any) => func = listener;

        disableSelection(element);

        expect(element.getAttribute('unselectable')).toBe('on');
        expect(element.style.userSelect).toBe('none');
        expect(func).toBeDefined();
        expect(func()).toBe(false);
    });
});

describe('escape', () => {
    it('should encode & as &amp;', () => {
        expect(escape('&')).toBe('&amp;');
    });

    it('should encode < as &lt;', () => {
        expect(escape('<')).toBe('&lt;');
    });

    it('should encode > as &gt;', () => {
        expect(escape('>')).toBe('&gt;');
    });

    it('should encode " as &quot;', () => {
        expect(escape('"')).toBe('&quot;');
    });

    it('should encode multiple & as &amp;', () => {
        expect(escape('&&')).toBe('&amp;&amp;');
    });

    it('should encode multiple < as &lt;', () => {
        expect(escape('<<')).toBe('&lt;&lt;');
    });

    it('should encode multiple > as &gt;', () => {
        expect(escape('>>')).toBe('&gt;&gt;');
    });

    it('should encode multiple " as &quot;', () => {
        expect(escape('""')).toBe('&quot;&quot;');
    });

    it('should encode all characters', () => {
        expect(escape('&<>"')).toBe('&amp;&lt;&gt;&quot;');
    });

    it('should return empty string if parameter is null or undefined', () => {
        expect(escape(null)).toBe('');
        expect(escape(undefined)).toBe('');
    });

    it('should convert any type to a string', () => {
        expect(escape(1)).toBe('1');
        expect(escape(true)).toBe('true');
        expect(escape({})).toBe('[object Object]');
    });

    it('uses this.value if no argument passed', () => {
        expect(escape.apply({ value: "&><" }, [])).toBe("&amp;&gt;&lt;");
    });
});
