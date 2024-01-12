let currentMonth = 0;
let currentYear = 2024;

function generateCalendar(month, year) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const calendarContainer = document.getElementById('calendar-container');
    const table = document.createElement('table');

    // Create table header with weekdays
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const headerRow = document.createElement('tr');
    weekdays.forEach(weekday => {
        const th = document.createElement('th');
        th.textContent = weekday;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create table rows with days of the month
    let dayCount = 1;
    for (let i = 0; i < 5; i++) { // Reduced to 5 rows
        const row = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            if ((i === 0 && j < firstDayOfMonth) || dayCount > daysInMonth) {
                // Empty cells before the first day and after the last day of the month
                cell.textContent = '';
            } else {
                const dateButton = document.createElement('button');
                dateButton.textContent = dayCount;
                dateButton.addEventListener('click', () => {
                    downloadZip(`${year}-${month + 1}-${dayCount}`);
                });
                cell.appendChild(dateButton);
                dayCount++;
            }
            row.appendChild(cell);
        }
        table.appendChild(row);
    }

    calendarContainer.innerHTML = '';
    calendarContainer.appendChild(table);

    document.getElementById('currentMonthYear').textContent = `${getMonthName(month)} ${year}`;
}

function toggleAdminControls() {
    const isAdmin = document.getElementById('isAdmin').checked;
    document.getElementById('adminControls').style.display = isAdmin ? 'block' : 'none';
}

function downloadZip(selectedDate) {
    // Simulate file download using GitHub repository structure
    const zipFileName = `public/notes_${selectedDate}.zip`;
    
    // Create a link and trigger a click event to download the file
    const link = document.createElement('a');
    link.href = zipFileName;
    link.download = `notes_${selectedDate}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function uploadFiles() {
    const fileInput = document.getElementById('fileInput');
    const dateInput = document.getElementById('dateInput');
    
    if (!fileInput.files.length || !dateInput.value) {
        alert('Please select files and choose a date.');
        return;
    }

    const files = Array.from(fileInput.files);
    const date = dateInput.value;
    const zipFileName = `public/notes_${date}.zip`;

    const zip = new JSZip();
    files.forEach(file => {
        zip.file(file.name, file);
    });

    zip.generateAsync({ type: 'blob' })
        .then(blob => {
            // Create a link and trigger a click event to download the zip file
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `notes_${date}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch(error => {
            console.error('Error generating zip file:', error);
        });
}

function uploadAllFiles() {
    if (!document.getElementById('isAdmin').checked) {
        alert('You do not have permission to perform this action.');
        return;
    }
    alert('Uploading all files for the selected date. Implement the logic here.');
}

function getMonthName(month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month];
}

function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
}

generateCalendar(currentMonth, currentYear);
