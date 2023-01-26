import { Column, initializeColumns, titleize } from "@/core/column";

it('should set defaults of the columns', () => {
    const column: Column = {};

    initializeColumns([column], {
        width: 200,
        cssClass: 'test'
    });

    expect(column.width).toBe(200);
    expect(column.cssClass).toBe('test');
});

it('should delete nameIsHtml if name is undefined', () => {
    const columns: Column[] = [
        { name: 'test', nameIsHtml: true },
        { name: null, nameIsHtml: true },
        { name: undefined, nameIsHtml: true },
    ];

    initializeColumns(columns, {
        nameIsHtml: true
    });

    expect(columns[0].nameIsHtml).toBe(true);
    expect(columns[1].nameIsHtml).toBe(true);
    expect(columns[2].nameIsHtml).toBe(undefined);
});

it('should create new id if column id is used', () => {
    const columns: Column[] = [
        { id: 'test', name: 'test' },
        { id: 'test', name: 'test' },
        { id: 'test', name: 'test' },
    ];

    initializeColumns(columns, {});

    expect(columns[0].id).toBe('test');
    expect(columns[1].id).toBe('test_1');
    expect(columns[2].id).toBe('test_2');
});

it('should generate id from field if id is null', () => {
    const column: Column = { id: null, field: 'test' };

    initializeColumns([column], {});

    expect(column.id).toBe('test');
});

it('should generate id as col if id and field are null', () => {
    const column: Column = { id: null, field: null };

    initializeColumns([column], {});

    expect(column.id).toBe('col');
});

it('should use field instead of id when generating unique col id if id is null', () => {
    const columns: Column[] = [
        { id: 'test', name: 'test' },
        { id: null, field: 'test', name: 'test' },
        { id: null, field: 'test', name: 'test' },
    ];

    initializeColumns(columns, {});

    expect(columns[0].id).toBe('test');
    expect(columns[1].id).toBe('test_1');
    expect(columns[2].id).toBe('test_2');
});

it('should use generated column id correctly when field and id are null', () => {
    const columns: Column[] = [
        { id: null, field: null, name: 'test' },
        { id: null, field: null, name: 'test' },
        { id: null, field: null, name: 'test' },
    ];

    initializeColumns(columns, {});

    expect(columns[0].id).toBe('col');
    expect(columns[1].id).toBe('col_1');
    expect(columns[2].id).toBe('col_2');
});

it('should be able to constrain the minWidth of the column', () => {
    const column: Column = { minWidth: 100, width: 50 };

    initializeColumns([column], {});
    expect(column.width).toBe(100);
});

it('should be able to constrain the maxWidth of the column', () => {
    const column: Column = { maxWidth: 100, width: 200 };

    initializeColumns([column], {});
    expect(column.width).toBe(100);
});

it('should not override already existing properties', () => {
    const columns: Column[] = [
        { id: 'c1', name: 'c1', width: 100 },
        { id: 'c2', name: 'c2', minWidth: 50},
        { id: 'c3', name: 'c3', maxWidth: 200 },
    ];

    initializeColumns(columns, {
        width: 200,
        minWidth: 100,
        maxWidth: 300
    });

    expect(columns[0].width).toBe(100);
    expect(columns[0].minWidth).toBe(100);
    expect(columns[0].maxWidth).toBe(300);

    expect(columns[1].width).toBe(200);
    expect(columns[1].minWidth).toBe(50);
    expect(columns[1].maxWidth).toBe(300);

    expect(columns[2].width).toBe(200);
    expect(columns[2].minWidth).toBe(100);
    expect(columns[2].maxWidth).toBe(200);
});

it('should use titleized field or id to generate name when its undefined', () => {
    const columns: Column[] = [
        { id: 'test', name: 'test abc' },
        { id: 'test abc', name: undefined, field: null },
        { id: null, name: undefined, field: 'test abcdef' },
        { id: null, name: undefined, field: null }
    ];

    initializeColumns(columns, {});

    expect(columns[0].name).toBe('test abc');
    expect(columns[1].name).toBe('Test Abc');
    expect(columns[2].name).toBe('Test Abcdef');
    expect(columns[3].name).toBe('Col'); // auto-generated id


});

it('titleize should work with empty values', () => {
    expect(titleize(null)).toBe(null);
    expect(titleize(undefined)).toBe(undefined);
    expect(titleize("")).toBe("");
    expect(titleize(0 as any)).toBe(0);    
})