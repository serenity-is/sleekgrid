export function addClass(el: Element, cls: string) {
    if (cls == null || !cls.length)
        return;

    if (cls.indexOf(' ') >= 0) {
        var arr = cls.split(' ').map(x => x.trim()).filter(x => x.length);
        for (var a of arr)
            el.classList.add(a);
    }
    else
        el.classList.add(cls);
}

export function attrEncode(s: any) {
    if (s == null)
        return '';

    return (s + "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export function disableSelection(target: HTMLElement) {
    if (target) {
        target.setAttribute('unselectable', 'on');
        target.style.userSelect = "none";
        target.addEventListener('selectstart', () => false);
    }
}

export function removeClass(el: Element, cls: string) {
    if (cls == null || !cls.length)
        return;

    if (cls.indexOf(' ') >= 0) {
        var arr = cls.split(' ').map(x => x.trim()).filter(x => x.length);
        for (var a of arr)
            el.classList.remove(a);
    }
    else
        el.classList.remove(cls);
}

export function H<K extends keyof HTMLElementTagNameMap>(tag: K, attr?: { [key: string]: (string | boolean) }, ...children: Node[]): HTMLElementTagNameMap[K] {
    var el = document.createElement(tag);
    var k: string, v: (string | boolean), c: Node;
    if (attr) {
        for (k in attr) {
            v = attr[k];
            if (v != null && v !== false)
                el.setAttribute(k, v === true ? '' : v);
        }
    }
    if (children) {
        for (c of children)
            el.appendChild(c);
    }
    return el;
}

export function htmlEncode(s: any) {
    if (s == null)
        return '';

    return (s + "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
}

export function spacerDiv(width: string): HTMLDivElement {
    return H('div', { style: 'display:block;height:1px;position:absolute;top:0;left:0;', width });
}
