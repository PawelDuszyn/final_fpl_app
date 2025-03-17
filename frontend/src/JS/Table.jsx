import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper, TextField, Button } from '@mui/material';
import axios from 'axios';
import '../CSS/Table.css';

const EnhancedTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'total points', direction: 'desc' });
    const [page, setPage] = useState(0);
    const rowsPerPage = 20;

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/get-players-stats`);
                setData(response.data);
                console.log(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl]);

    const handleNextPage = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handlePreviousPage = () => {
        setPage(prev => Math.max(prev - 1, 0));
    };

    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const handleSort = (column) => {
        let direction = 'desc';
        if (sortConfig.key === column && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key: column, direction });
    };

    const sortedData = [...data].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        const aIsNumber = !isNaN(parseFloat(aValue)) && isFinite(aValue);
        const bIsNumber = !isNaN(parseFloat(bValue)) && isFinite(bValue);

        if (aIsNumber && bIsNumber) {
            const aNum = parseFloat(aValue);
            const bNum = parseFloat(bValue);
            if (aNum < bNum) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aNum > bNum) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
        } else {
            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
        }
        return 0;
    });

    const filteredData = sortedData.filter(row =>
        Object.values(row).some(value =>
            value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const paginatedData = filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!data.length) {
        return <p>No data available</p>;
    }

    return (
        <div className="page-container">
            <TextField
                label="Search"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: '20px' }}
                className="search-field"
            />
            <TableContainer component={Paper} className="table-container">
                <Table className="table">
                    <TableHead className="table-head">
                        <TableRow className="table-row">
                            {columns.map((col) => (
                                <TableCell key={col} className={`table-cell table-cell-${col.replace(/\s+/g, '-').toLowerCase()}`}>
                                    <TableSortLabel className="sort-table-label"
                                        active={sortConfig.key === col}
                                        direction={sortConfig.direction}
                                        onClick={() => handleSort(col)}
                                    >
                                        {capitalizeFirstLetter(col)}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody className="table-body">
                        {paginatedData.map((row, rowIndex) => (
                            <TableRow className="table-row" key={rowIndex}>
                                {columns.map((col) => (
                                   <TableCell key={col} className={`table-cell table-cell-${col.replace(/\s+/g, '-').toLowerCase()}`}>
                                   {col === 'cost' ? (row[col] / 10).toFixed(1) :
                                    col === 'form' ? row[col].toFixed(1) :
                                    col === 'Selected by %' ? row[col].toFixed(1) :
                                    row[col]}
                               </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <div className="pagination-buttons">
                <Button onClick={handlePreviousPage} disabled={page === 0} className="pagination-button">Previous</Button>
                <Button onClick={handleNextPage} disabled={(page + 1) * rowsPerPage >= filteredData.length} className="pagination-button">Next</Button>
            </div>
        </div>
    );
};

export default EnhancedTable;