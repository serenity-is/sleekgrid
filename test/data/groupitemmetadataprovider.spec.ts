import { ColumnFormat, CompatFormatter, escape } from "@/core";
import { GroupItemMetadataProvider, } from "@/data/groupitemmetadataprovider"

describe("GroupItemMetadataProvider.defaults", () => {
    it("has expected default values", () => {
        expect(GroupItemMetadataProvider.defaults.enableExpandCollapse).toBe(true);
        expect(GroupItemMetadataProvider.defaults.groupIndentation).toBe(15);
        expect(GroupItemMetadataProvider.defaults.groupFocusable).toBe(true);
        expect(GroupItemMetadataProvider.defaults.totalsFocusable).toBe(false);
    });

    it("has expected default css classes", () => {
        expect(GroupItemMetadataProvider.defaults.groupCellCssClass).toBe("slick-group-cell");
        expect(GroupItemMetadataProvider.defaults.groupCssClass).toBe("slick-group");
        expect(GroupItemMetadataProvider.defaults.groupLevelPrefix).toBe("slick-group-level-");
        expect(GroupItemMetadataProvider.defaults.groupTitleCssClass).toBe("slick-group-title");
        expect(GroupItemMetadataProvider.defaults.totalsCssClass).toBe("slick-group-totals");
        expect(GroupItemMetadataProvider.defaults.toggleCssClass).toBe("slick-group-toggle");
        expect(GroupItemMetadataProvider.defaults.toggleCollapsedCssClass).toBe("collapsed");
        expect(GroupItemMetadataProvider.defaults.toggleExpandedCssClass).toBe("expanded");
    });
});

describe("GroupItemMetadataProvider constructor", () => {
    it("uses options passed", () => {
        var old = GroupItemMetadataProvider.defaults.groupLevelPrefix;
        try {
            GroupItemMetadataProvider.defaults.groupLevelPrefix = "x-";
            var provider = new GroupItemMetadataProvider({ totalsCssClass: "y" });
            var options = provider.getOptions();
            expect(options.enableExpandCollapse).toBe(true);
            expect(options.groupLevelPrefix).toBe("x-");
            expect(options.totalsCssClass).toBe("y");
            expect(GroupItemMetadataProvider.defaults.totalsCssClass).toBe("slick-group-totals");
        }
        finally {
            GroupItemMetadataProvider.defaults.groupLevelPrefix = old;            
        }
    });

    it("uses groupFormat if passed", () => {
        var groupFormat: ColumnFormat = () => "ok";
        var provider = new GroupItemMetadataProvider({ groupFormat });
        expect(provider.getOptions().groupFormat === groupFormat).toBe(true);
    });

    it("uses groupFormat if both groupFormat and compat groupFormatter passed", () => {
        var groupFormat: ColumnFormat = () => "ok";
        var groupFormatter: CompatFormatter = () => "ok";
        var provider = new GroupItemMetadataProvider({ groupFormat, groupFormatter });
        expect(provider.getOptions().groupFormat === groupFormat).toBe(true);
    });

    it("uses converted compat groupFormatter if passed", () => {
        var groupFormatter: CompatFormatter = () => "compat";
        var provider = new GroupItemMetadataProvider({ groupFormatter });
        expect(provider.getOptions().groupFormatter === groupFormatter).toBe(true);
        expect(provider.getOptions().groupFormat as any !== groupFormatter).toBe(true);
        expect(provider.getOptions().groupFormat).toBeDefined();
        expect(provider.getOptions().groupFormat({ escape })).toBe("compat");
    });

    it("uses defaultGroupFormat if none passed", () => {
        var old = GroupItemMetadataProvider.defaultGroupFormat;
        try {
            GroupItemMetadataProvider.defaultGroupFormat = (ctx, o) => { opt = o; return ""; }
            var opt: any = null;
            var provider = new GroupItemMetadataProvider();
            var format = provider.getOptions().groupFormat;
            expect(format).toBeDefined();
            format({ escape });
            expect(opt === provider.getOptions()).toBe(true);
        }
        finally {
            GroupItemMetadataProvider.defaultGroupFormat = old;
        }
    });    

    it("uses totalsFormat if passed", () => {
        var totalsFormat: ColumnFormat = () => "ok";
        var provider = new GroupItemMetadataProvider({ totalsFormat });
        expect(provider.getOptions().totalsFormat === totalsFormat).toBe(true);
    });

    it("uses totalsFormat if both totalsFormat and compat totalsFormatter passed", () => {
        var totalsFormat: ColumnFormat = () => "ok";
        var totalsFormatter: CompatFormatter = () => "ok";
        var provider = new GroupItemMetadataProvider({ totalsFormat, totalsFormatter });
        expect(provider.getOptions().totalsFormat === totalsFormat).toBe(true);
    });

    it("uses converted compat totalsFormatter if passed", () => {
        var totalsFormatter: CompatFormatter = () => "compat";
        var provider = new GroupItemMetadataProvider({ totalsFormatter });
        expect(provider.getOptions().totalsFormatter === totalsFormatter).toBe(true);
        expect(provider.getOptions().totalsFormat as any !== totalsFormatter).toBe(true);
        expect(provider.getOptions().totalsFormat).toBeDefined();
        expect(provider.getOptions().totalsFormat({ escape })).toBe("compat");
    });

    it("uses defaultTotalsFormat if none passed", () => {
        var old = GroupItemMetadataProvider.defaultTotalsFormat;
        try {
            GroupItemMetadataProvider.defaultTotalsFormat = (ctx, o) => { called = true; return ""; }
            var called = false;
            var provider = new GroupItemMetadataProvider();
            var format = provider.getOptions().totalsFormat;
            expect(format).toBeDefined();
            format({ escape });
            expect(called).toBe(true);
        }
        finally {
            GroupItemMetadataProvider.defaultTotalsFormat = old;
        }
    });    

});

describe("GroupItemMetadataProvider.setOptions", () => {
    it("merges current options with passed ones", () => {
        var provider = new GroupItemMetadataProvider({ totalsCssClass: "y", groupCssClass: "z" });
        var options = provider.getOptions();
        expect(options.totalsCssClass).toBe("y");
        expect(options.groupCssClass).toBe("z");
        provider.setOptions({ totalsCssClass: "w"});
        expect(options.totalsCssClass).toBe("w");
        expect(options.groupCssClass).toBe("z");
    });
});
