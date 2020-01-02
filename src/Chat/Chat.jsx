import React, {PureComponent} from 'react';
import {AutoSizer, CellMeasurer, CellMeasurerCache, InfiniteLoader, List} from 'react-virtualized';
import Scrollbar from 'react-scrollbars-custom';
import cx from 'classnames';
import './Chat.scss';
import {RowType} from './chat.enum';
import {chatSettings} from './chat.settings';
import {
    getFloatingDate,
    getFloatingDatePosition,
    getMessagesSectionDate, getNewRowsWithDateFromPrevChunk,
    getRenderedRowsWithRecalculatedPositions,
    getRows,
} from './chat.helper';
import MessageBubble from './components/MessageBubble';
import MessagesDate from './components/MessagesDate';

class Chat extends PureComponent {

    state = {
        rows: [],
        renderedRows: [],
        rowsHeight: 0,
        page: undefined,
        scrollTop: undefined,
        isFrameHidden: true,
        floatingDate: null,
        floatingDatePosition: chatSettings.FLOATING_DATE_MAX_OFFSET_FROM_TOP_BAR,
        floatingDateMaxOffsetFromWindowTop: chatSettings.FLOATING_DATE_MAX_OFFSET_FROM_TOP_BAR,
    };

    /** React virtualized List component ref */
    list = React.createRef();

    /** CellMeasurer component cache */
    cellMeasurerCache = new CellMeasurerCache({
        defaultHeight: chatSettings.DEFAULT_ROW_HEIGHT,
        fixedWidth: true,
    });

    /** Custom scrollbar component ref */
    scrollBar;

    /** Floating date ref */
    floatingDateRef;

    renderedRowsTmp = [];

    componentDidMount() {
        this.init();
    }

    componentDidUpdate(prevProps) {
        // console.log('this.props.newMessages', this.props.newMessages);
        if (prevProps.newMessages !== this.props.newMessages) {
            this.init(this.props.newMessages);
            if (this.props.newMessages.page) {
                this.setState({page: this.props.newMessages.page});
            } else {
                setTimeout(() => this.scrollToBottom());
            }
        }

        if (prevProps.draftMessage !== this.props.draftMessage) {
            this.scrollToBottom();
        }
    }

    init = (newMessages) => {
        let rows;
        if (newMessages) {
            let newRows = this.getNewRows(newMessages.items);
            if (newMessages.page) {
                const dateRow = this.state.rows[0];
                const newRowsWithDateFromPrevChunk = getNewRowsWithDateFromPrevChunk({dateRow, newRows});
                const renderedRows = newRows.length !== newRowsWithDateFromPrevChunk.length ? this.state.rows.slice(1, this.state.rows.length) : this.state.rows;
                const renderedRowsWithRecalculatedIndexes = renderedRows.map((r, i) => {
                    r.index = i + newRowsWithDateFromPrevChunk.length;
                    return r;
                });
                rows = [...newRowsWithDateFromPrevChunk, ...renderedRowsWithRecalculatedIndexes];
            } else {
                rows = [...this.state.rows, ...newRows];
            }
            this.setState({rows}, () => {
                setTimeout(() => {
                    this.scrollToBottom();
                })
            });
        } else {
            rows = getRows(this.props.chatHistory);
            this.setState({rows, renderedRows: [], rowsHeight: 0, isFrameHidden: true});
            this.renderedRowsTmp = [];
        }
        console.log('rows', rows);
    };

    getNewRows = (newMessages) => {
        const dates = this.state.rows.filter(item => item.type === RowType.DATE).map(v => v.content);
        return getRows(newMessages, this.state.rows.length, dates);
    };

    scrollToBottom = () => {
        this.scrollBar && this.scrollBar.scrollToBottom();
    };

    loadMoreRows = () => {
        if (this.state.page === undefined) {
            this.setState({page: 0});
        } else {
            this.props.onScrollTop(this.state.page);
        }
    };

    isRowLoaded({index}) {
        return index > 0;
    }

    onScroll = (scrollValues) => {
        // if (scrollValues.scrollTop === 0) {
        //     this.props.onScrollTop(this.state.page);
        // }
        const {scrollTop, scrollLeft} = scrollValues;
        this.setState({scrollTop});
        const {Grid: grid} = this.list;

        this.updateFloatingDate();

        /** Let react-virtualized List component handle scroll */
        grid.handleScrollEvent({scrollTop, scrollLeft});
    };

    updateFloatingDate = () => {
        const rows = getRenderedRowsWithRecalculatedPositions(this.state.renderedRows);
        this.setFloatingDate(rows);
        this.setFloatingDatePosition(rows);
        this.setDateRowsVisibility(rows);
    };

    setFloatingDate = (rows) => {
        const floatingDate = getFloatingDate(rows, this.state.floatingDateMaxOffsetFromWindowTop);
        if (floatingDate) {
            const shouldUpdateFloatingDate =
                !this.state.floatingDate || this.state.floatingDate.value !== floatingDate.value;

            if (shouldUpdateFloatingDate) {
                this.setState({floatingDate});
            }
        }
    };

    setFloatingDatePosition = (rows) => {
        const top = getFloatingDatePosition(rows, this.state.floatingDateMaxOffsetFromWindowTop);
        this.floatingDateRef.style.top = `${top}px`;
    };

    setDateRowsVisibility = (rows) => {
        rows.filter(item => item.row.type === RowType.DATE).forEach(item => {
            const isVisible =
                item.row.index === 0 ? false : item.rect.top > this.state.floatingDateMaxOffsetFromWindowTop;
            /** Need to change date rows visibility directly,
             *  otherwise fast scrolling leads to delays in making rows visible
             */
            item.ref.className = isVisible ? 'chat__row' : 'chat__row chat__row--hidden';
        });
    };

    setFloatingDateRef = (ref) => {
        this.floatingDateRef = ref;
    };

    onRowsRendered = (onRowsRendered) => ({startIndex, stopIndex}) => {
        this.setState(
            {
                renderedRows: this.renderedRowsTmp,
            },
            this.onAfterSetRenderedRowsToState,
        );
        onRowsRendered && onRowsRendered({startIndex, stopIndex});
    };

    onAfterSetRenderedRowsToState = () => {
        if (this.floatingDateRef) {
            this.updateFloatingDate();
        }

        const rowsHeight = this.state.renderedRows.reduce((acc, item) => acc + item.height, 0);
        this.setState({rowsHeight});

        /** Scroll to bottom on initial loading */
        if (this.state.isFrameHidden && rowsHeight !== this.state.rowsHeight) {
            this.setState({scrollTop: rowsHeight});
        }

        if (this.state.floatingDateMaxOffsetFromWindowTop === chatSettings.FLOATING_DATE_MAX_OFFSET_FROM_TOP_BAR) {
            const floatingDateMaxOffsetFromWindowTop =
                (this.floatingDateRef && this.floatingDateRef.getBoundingClientRect().top) ||
                chatSettings.FLOATING_DATE_MAX_OFFSET_FROM_TOP_BAR;
            this.setState({floatingDateMaxOffsetFromWindowTop});
        }

        const r = this.state.renderedRows[this.state.renderedRows.length - 1];
        if (r.row.index === this.state.rows.length - 1) {
            setTimeout(() => {
                this.setState({isFrameHidden: false});
            }, 100);
        }

    };

    setRowRef = ({index, style, row}) => (ref) => {
        if (ref) {
            const renderedRow = this.renderedRowsTmp.find(item => item.row.index === index);
            const height = style.height;
            if (renderedRow) {
                renderedRow.ref = ref;
                renderedRow.height = height;
            } else {
                this.renderedRowsTmp.push({ref, row, height});
            }
        }
    };

    setScrollbarRef = (instance) => {
        this.scrollBar = instance;
    };

    rowRenderer = ({index, key, style, parent}) => {
        // index= this.state.rows.length - 1;
        const row = this.state.rows.find(item => item.index === index);
        return (
            <CellMeasurer cache={this.cellMeasurerCache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
                <div
                    ref={this.setRowRef({index, style, row})}
                    key={key}
                    style={style}
                    className={cx('chat__row', {'chat__row--date': row.type === RowType.DATE})}
                >
                    {row.type === RowType.DATE ? (
                        <MessagesDate key={row.index} date={row.content}/>
                    ) : (
                        <MessageBubble
                            key={row.index}
                            message={row.content}
                        />
                    )}
                </div>
            </CellMeasurer>
        );
    };

    setListRef = (registerChild) => (ref) => {
        registerChild && registerChild(ref);
        this.list = ref;
    };

    renderList = ({height, width, top, onRowsRendered, registerChild}) => {
        return (
            <List
                className={'chat__list'}
                ref={this.setListRef(registerChild)}
                onRowsRendered={this.onRowsRendered(onRowsRendered)}
                height={height}
                rowCount={this.state.rows.length}
                rowHeight={this.cellMeasurerCache.rowHeight}
                rowRenderer={this.rowRenderer}
                width={width}
                style={{top: `${top}px`, overflowX: 'visible', overflowY: 'visible'}}
            />
        );
    };

    renderListWithScrollbar = ({height, width, top}) => (
        <InfiniteLoader
            isRowLoaded={this.isRowLoaded}
            loadMoreRows={this.loadMoreRows}
            rowCount={this.state.rows.length}
            threshold={1}
        >
            {({onRowsRendered, registerChild}) => {
                return (
                    <>
                        <div
                            className={'chat__floating-date'}
                            ref={this.setFloatingDateRef}
                        >
                            {this.state.floatingDate && <MessagesDate date={this.state.floatingDate.value}/>}
                        </div>
                        <Scrollbar
                            style={{height, width}}
                            createContext={true}
                            noScrollX={true}
                            onScroll={this.onScroll}
                            ref={this.setScrollbarRef}
                            scrollTop={this.state.scrollTop}
                        >
                            {this.renderList({height, width, top, onRowsRendered, registerChild})}
                        </Scrollbar>
                    </>
                )
            }}
        </InfiniteLoader>
    );

    render() {
        return this.state.rows.length ? (
            <div className="chat__wrapper">
                <AutoSizer className={cx('chat', {'chat--hidden': this.state.isFrameHidden})}>
                    {({height, width}) => {
                        const messagesOffsetTop = height - this.state.rowsHeight;
                        const top = messagesOffsetTop > 0 ? messagesOffsetTop : 0;
                        return top > 0 ? (
                            this.renderList({height, width, top})
                        ) : (
                            this.renderListWithScrollbar({height, width, top})
                        );
                    }}
                </AutoSizer>
            </div>
        ) : null;
    }
}

export default Chat;
