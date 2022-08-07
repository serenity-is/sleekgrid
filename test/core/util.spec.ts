import { addClass, removeClass, disableSelection, H, spacerDiv, attrEncode, htmlEncode } from "@/core/util";

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
        element.addEventListener = jest.fn();

        disableSelection(element);

        expect(element.getAttribute('unselectable')).toBe('on');
        expect(element.style.userSelect).toBe('none');
        expect(element.addEventListener).toBeCalledWith('selectstart', expect.any(Function));
    });
});

describe('attrEncode', () => {
    it('should encode & as &amp;', () => {
        expect(attrEncode('&')).toBe('&amp;');
    });

    it('should encode < as &lt;', () => {
        expect(attrEncode('<')).toBe('&lt;');
    });

    it('should encode > as &gt;', () => {
        expect(attrEncode('>')).toBe('&gt;');
    });

    it('should encode " as &quot;', () => {
        expect(attrEncode('"')).toBe('&quot;');
    });

    it('should encode multiple & as &amp;', () => {
        expect(attrEncode('&&')).toBe('&amp;&amp;');
    });

    it('should encode multiple < as &lt;', () => {
        expect(attrEncode('<<')).toBe('&lt;&lt;');
    });

    it('should encode multiple > as &gt;', () => {
        expect(attrEncode('>>')).toBe('&gt;&gt;');
    });

    it('should encode multiple " as &quot;', () => {
        expect(attrEncode('""')).toBe('&quot;&quot;');
    });

    it('should encode all characters', () => {
        expect(attrEncode('&<>"')).toBe('&amp;&lt;&gt;&quot;');
    });

    it('should return empty string if parameter is null or undefined', () => {
        expect(attrEncode(null)).toBe('');
        expect(attrEncode(undefined)).toBe('');
    });

    it('should convert any type to a string', () => {
        expect(attrEncode(1)).toBe('1');
        expect(attrEncode(true)).toBe('true');
        expect(attrEncode({})).toBe('[object Object]');
    });
});

describe('htmlEncode', () => {
    it('should encode & as &amp;', () => {
        expect(htmlEncode('&')).toBe('&amp;');
    });

    it('should encode < as &lt;', () => {
        expect(htmlEncode('<')).toBe('&lt;');
    });

    it('should encode > as &gt;', () => {
        expect(htmlEncode('>')).toBe('&gt;');
    });

    it('should encode multiple & as &amp;', () => {
        expect(htmlEncode('&&')).toBe('&amp;&amp;');
    });

    it('should encode multiple < as &lt;', () => {
        expect(htmlEncode('<<')).toBe('&lt;&lt;');
    });

    it('should encode multiple > as &gt;', () => {
        expect(htmlEncode('>>')).toBe('&gt;&gt;');
    });

    it('should encode all characters', () => {
        expect(htmlEncode('&<>')).toBe('&amp;&lt;&gt;');
    });

    it('should return empty string if parameter is null or undefined', () => {
        expect(htmlEncode(null)).toBe('');
        expect(htmlEncode(undefined)).toBe('');
    });

    it('should convert any type to a string', () => {
        expect(htmlEncode(1)).toBe('1');
        expect(htmlEncode(true)).toBe('true');
        expect(htmlEncode({})).toBe('[object Object]');
    });
});
