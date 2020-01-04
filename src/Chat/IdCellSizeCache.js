//https://github.com/bvaughn/react-virtualized/issues/341#issuecomment-239519259
class IdCellSizeCache {
    constructor(baseCollection, lookupFn) {
        this.baseCollection = baseCollection;
        this.lookupFn = lookupFn.bind(this);
        this.rowHeightCache = {};
        this.columnWidthCache = {};
    }

    /*
     * new methods
     */
    updateCollection(newCollection) { this.baseCollection = newCollection; }
    getId(index) { return this.lookupFn(this.baseCollection, index); }

    /*
     * required methods
     */
    clearAllColumnWidths() { this.columnWidthCache = {}; }
    clearAllRowHeights() { this.rowHeightCache = {}; }
    clearColumnWidth(index) { delete this.columnWidthCache[this.getId(index)]; }
    clearRowHeight(index) { delete this.rowHeightCache[this.getId(index)]; }
    getColumnWidth(index) { return this.columnWidthCache[this.getId(index)]; }
    getRowHeight(index) { return this.rowHeightCache[this.getId(index)]; }
    hasColumnWidth(index) { return this.columnWidthCache[this.getId(index)] >= 0; }
    hasRowHeight(index) { return this.rowHeightCache[this.getId(index)] >= 0; }
    setColumnWidth(index, value) { this.columnWidthCache[this.getId(index)] = value; }
    setRowHeight(index, value) { this.rowHeightCache[this.getId(index)] = value; }
}

export default IdCellSizeCache;