import React, {PureComponent} from 'react';
import {AutoSizer, CellMeasurer, CellMeasurerCache, List} from 'react-virtualized';
import Scrollbar from 'react-scrollbars-custom';
import cx from 'classnames';
import './Chat.scss';
import {RowType} from './chat.enum';
import {chatSettings} from './chat.settings';
import {
    getFloatingDate,
    getFloatingDatePosition,
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
        const messagesCountDiff = prevProps.messages.length - this.props.messages.length;
        if (messagesCountDiff) {
            this.init(messagesCountDiff);
        }

        if (prevProps.message !== this.props.message) {
            this.scrollToBottom();
        }
    }

    init = (messagesCountDiff) => {
        let rows;
        if (messagesCountDiff < 0) {
            const newRows = this.getNewRows(messagesCountDiff);
            rows = [...this.state.rows, ...newRows];
            this.setState({rows});
        } else {
            rows = getRows(this.props.messages);
            this.setState({rows, renderedRows: [], rowsHeight: 0, isFrameHidden: true});
            this.renderedRowsTmp = [];
        }
    };

    getNewRows = (messagesCountDiff) => {
        const newMessages = this.props.messages.slice(messagesCountDiff);
        const dates = this.state.rows.filter(item => item.type === RowType.DATE).map(v => v.content);
        return getRows(newMessages, this.state.rows.length, dates);
    };

    scrollToBottom = () => {
        this.scrollBar && this.scrollBar.scrollToBottom();
    };

    onScroll = (scrollValues) => {
        const {scrollTop, scrollLeft} = scrollValues;
        this.setState({scrollTop});
        const {Grid: grid} = this.list.current;

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

    onRowsRendered = () => {
        this.setState(
            {
                renderedRows: this.renderedRowsTmp,
            },
            this.onAfterSetRenderedRowsToState,
        );
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
            this.setState({isFrameHidden: false});
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

    renderList = ({height, width, top}) => (
        <List
            className={'chat__list'}
            ref={this.list}
            height={height}
            rowCount={this.state.rows.length}
            rowHeight={this.cellMeasurerCache.rowHeight}
            rowRenderer={this.rowRenderer}
            onRowsRendered={this.onRowsRendered}
            width={width}
            style={{top: `${top}px`, overflowX: 'visible', overflowY: 'visible'}}
        />
    );

    renderListWithScrollbar = ({height, width, top}) => (
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
                {this.renderList({height, width, top})}
            </Scrollbar>
        </>
    );

    render() {
        return this.state.rows.length ? (
            <div className="chat__wrapper">
                <AutoSizer
                    className={cx(
                        'chat',
                        {'chat--hidden': this.state.isFrameHidden},
                    )}
                >
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
