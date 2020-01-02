import {chatSettings} from './chat.settings';
import {MessageSectionDate, RowType} from './chat.enum';
import {format, isThisYear, isToday, isYesterday} from 'date-fns';

/** Convert messages to rows array */
export const getRows = (messages, startIndex = 0, dates = []) => {
    let curDate;
    let prevDate;
    return messages
        .sort((a, b) => a.timestamp - b.timestamp)
        .reduce((acc, item) => {
            curDate = getMessagesSectionDate(item.timestamp);
            const shouldSetDateRow =
                (!prevDate || (prevDate && prevDate !== curDate)) && dates.findIndex(date => date === curDate) === -1;
            if (shouldSetDateRow) {
                acc.push({
                    type: 'date',
                    height: chatSettings.DEFAULT_ROW_HEIGHT,
                    index: acc.length + startIndex,
                    content: curDate,
                });
            }
            acc.push({
                type: 'message',
                height: chatSettings.DEFAULT_ROW_HEIGHT,
                index: acc.length + startIndex,
                content: item,
            });
            prevDate = curDate;
            return acc;
        }, []);
};

export const getRenderedRowsWithRecalculatedPositions = (renderedRows) => {
    return renderedRows.map(item => {
        item.rect = item.ref.getBoundingClientRect();
        return item;
    });
};

export const getFloatingDate = (rows, floatingDateMaxOffsetFromWindowTop) => {
    let floatingDate = null;

    const dateRows = rows
        .filter(item => item.row.type === RowType.DATE)

        /** Filter those dates that are visible or already scrolled down */
        .filter(item => item.rect.height && item.rect.top <= floatingDateMaxOffsetFromWindowTop);

    if (dateRows.length) {
        /** Determine the date that is the closest to the visible part */
        dateRows.forEach(item => {
            const shouldSetFloatingDate = !floatingDate || (floatingDate && floatingDate.top < item.rect.top);
            if (shouldSetFloatingDate) {
                floatingDate = {value: item.ref.textContent, top: item.rect.top};
            }
        });
    } else {
        const firstRow = getFirstRenderedRow(rows);
        if (firstRow) {
            const content = firstRow.row.content;
            const value = getMessagesSectionDate(content.timestamp);
            floatingDate = {value, top: firstRow.rect.top};
        }
    }
    return floatingDate;
};

export const getFloatingDatePosition = (rows, floatingDateMaxOffsetFromWindowTop) => {
    const dateRows = rows.filter(item => item.row.type === RowType.DATE);
    const dateRowNearFloatingDate = dateRows.find(item => {
        return (
            item.row.index !== 0 && // no need to change floating date position for the upper date
            item.rect.top <= floatingDateMaxOffsetFromWindowTop + chatSettings.FLOATING_DATE_ROW_DATE_OFFSET &&
            item.rect.top > floatingDateMaxOffsetFromWindowTop
        );
    });

    return dateRowNearFloatingDate
        ? dateRowNearFloatingDate.rect.top -
        chatSettings.FLOATING_DATE_ROW_DATE_OFFSET -
        (floatingDateMaxOffsetFromWindowTop - chatSettings.FLOATING_DATE_MAX_OFFSET_FROM_TOP_BAR)
        : chatSettings.FLOATING_DATE_MAX_OFFSET_FROM_TOP_BAR;
};

export const getMessagesSectionDate = (timestamp) => {
    if (isToday(timestamp)) return MessageSectionDate.TODAY;
    if (isYesterday(timestamp)) return MessageSectionDate.YESTERDAY;
    if (isThisYear(timestamp)) return format(timestamp, MessageSectionDate.WITHOUT_YEAR);
    return format(timestamp, MessageSectionDate.WITH_YEAR);
};

export const getNewRowsWithDateFromPrevChunk = ({dateRow, newRows}) => {
    let prevDate;
    return newRows.reduce((acc, r) => {
        if (r.type === RowType.MESSAGE) {
            const date = getMessagesSectionDate(r.content.timestamp);
            if (prevDate !== date && date === dateRow.content) {
                acc.push({...dateRow, index: acc.length});
            }
            prevDate = date;
        }
        r.index = acc.length;
        acc.push(r);
        return acc;
    }, []);
};

const getFirstRenderedRow = (renderedRows) => {
    const v = renderedRows
        .filter(item => item.row.type === RowType.MESSAGE)

        /** Filter those dates that are visible */
        .filter(item => item.rect.height && item.rect.top < 0);
    return v[0];
};
