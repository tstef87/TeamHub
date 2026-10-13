import * as React from 'react';
import PropTypes from 'prop-types';
import {
    Box, Paper, Skeleton, Table, TableBody, TableCell, TableContainer,
    TableHead, TablePagination, TableRow, TableSortLabel, Typography,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilized = array.map((el, index) => [el, index]);
    stabilized.sort((a, b) => comparator(a[0], b[0]) || a[1] - b[1]);
    return stabilized.map((el) => el[0]);
}

const cellAlign = (cell) => cell.align ?? (cell.numeric ? 'right' : 'left');

function EnhancedTableHead({ headCells, order, orderBy, onRequestSort }) {
    return (
        <TableHead>
            <TableRow>
                {headCells.map((cell) => (
                    <TableCell
                        key={cell.id}
                        align={cellAlign(cell)}
                        sortDirection={orderBy === cell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === cell.id}
                            direction={orderBy === cell.id ? order : 'asc'}
                            onClick={(e) => onRequestSort(e, cell.id)}
                        >
                            {cell.label}
                            {orderBy === cell.id && (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            )}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

export default function EnhancedTable({
    title,
    headCells,
    rows,
    loading = false,
    onRowClick,
    getRowId = (row) => row.id,
    defaultOrderBy,
    defaultOrder = 'asc',
    rowsPerPageOptions = [5, 10, 25],
    emptyMessage = 'No results found.',
}) {
    const [order, setOrder] = React.useState(defaultOrder);
    const [orderBy, setOrderBy] = React.useState(defaultOrderBy ?? headCells[0]?.id);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(rowsPerPageOptions[0]);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const visibleRows = React.useMemo(
        () =>
            stableSort(rows, getComparator(order, orderBy)).slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage,
            ),
        [rows, order, orderBy, page, rowsPerPage],
    );

    if (loading) {
        return <Skeleton variant="rectangular" width="100%" height={500} />;
    }

    return (
        <Paper sx={{ width: '100%', mb: 2 }}>
            <TableContainer>
                {title && (
                    <Typography variant="h3" sx={{ p: 2 }} id="tableTitle">
                        {title}
                    </Typography>
                )}
                <Table sx={{ minWidth: 750 }} aria-labelledby={title ? 'tableTitle' : undefined}>
                    <EnhancedTableHead
                        headCells={headCells}
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={handleRequestSort}
                    />
                    <TableBody>
                        {visibleRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={headCells.length} align="center">
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            visibleRows.map((row) => (
                                <TableRow
                                    hover={!!onRowClick}
                                    key={getRowId(row)}
                                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                                    sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                                >
                                    {headCells.map((cell) => (
                                        <TableCell key={cell.id} align={cellAlign(cell)}>
                                            {cell.render ? cell.render(row) : row[cell.id]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                rowsPerPageOptions={rowsPerPageOptions}
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
            />
        </Paper>
    );
}

EnhancedTable.propTypes = {
    title: PropTypes.string,
    headCells: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            numeric: PropTypes.bool,
            align: PropTypes.oneOf(['left', 'center', 'right']),
            render: PropTypes.func,
        }),
    ).isRequired,
    rows: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    onRowClick: PropTypes.func,
    getRowId: PropTypes.func,
    defaultOrderBy: PropTypes.string,
    defaultOrder: PropTypes.oneOf(['asc', 'desc']),
    rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
    emptyMessage: PropTypes.string,
};