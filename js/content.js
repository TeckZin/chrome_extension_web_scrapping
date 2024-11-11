// content.js
console.log('content script loaded');
document.addEventListener('click', function(event) {
    if (event.target.id === 'map' || event.target.closest('#map')) {
        // Function to extract table data
        function getTableData(table, index) {
            // Get headers
            const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
            // Get rows
            const rows = Array.from(table.querySelectorAll('tr')).map(tr =>
                Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
            ).filter(row => row.length > 0);

            return {
                index,
                headers,
                rows,
                classes: table.className,
                id: table.id || 'no-id',
                html: table.outerHTML
            };
        }

        // Get all tables on the page
        const tables = Array.from(document.querySelectorAll('table')).map((table, index) =>
            getTableData(table, index)
        );

        console.log('Tables found:', tables);

        // Send data to background script
        chrome.runtime.sendMessage({
            type: 'tableData',
            data: tables
        });
    }
});
