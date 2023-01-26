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

const esc = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": "&apos;",
    '&': '&amp;',
}

function escFunc(a: string) {
    return esc[a];
}

export function escape(s: any) {
    if (!arguments.length)
        s = this.value;

    if (s == null)
        return '';

    if (typeof s !== "string")
        s = "" + s;

    return s.replace(/[<>"'&]/g, escFunc)
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

export function H<K extends keyof HTMLElementTagNameMap>(tag: K, attr?: { ref?: (el?: HTMLElementTagNameMap[K]) => void, [key: string]: string | number | boolean | ((el?: HTMLElementTagNameMap[K]) => void) | null | undefined }, ...children: (string | Node)[]): HTMLElementTagNameMap[K] {
    var el = document.createElement(tag);
    var k: string, v: any, c: Node | string;
    if (attr) {
        for (k in attr) {
            v = attr[k];
            if (v != null && v !== false) {
                if (k === "ref" && typeof v === "function") {
                    (v as any)(el);
                    continue;
                }

                var key = k === "className" ? "class" : k;
                el.setAttribute(key, v === true ? '' : v as string);
            }
        }
    }

    if (children && children.length)
        el.append(...children);

    return el;
}

export function spacerDiv(width: string): HTMLDivElement {
    return H('div', { style: 'display:block;height:1px;position:absolute;top:0;left:0;', width });
}

export function parsePx(str: string) {
    var value = parseFloat(str);
    if (isNaN(value))
        return 0;
    return value;
}
