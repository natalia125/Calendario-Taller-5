document.addEventListener("DOMContentLoaded", function() {
    const monthYear = document.getElementById('month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    const prevMonth = document.getElementById('prev-month');
    const nextMonth = document.getElementById('next-month');
    const modal = document.getElementById('event-modal');
    const closeModal = document.getElementById('close-modal');
    let currentDate = new Date();
    let events = JSON.parse(localStorage.getItem('events')) || {};

    const monthlyView = document.getElementById('monthlyView');
    const dailyView = document.getElementById('dailyView');
    const yearlyView = document.getElementById('yearlyView');

    const dailyBtn = document.getElementById('daily');
    const monthlyBtn = document.getElementById('monthly');
    const yearlyBtn = document.getElementById('yearly');

    function renderCalendar() {
        calendarGrid.innerHTML = '';
        let tempDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const month = tempDate.getMonth();
        const year = tempDate.getFullYear();
    
        monthYear.textContent = tempDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
    
        const dayOfWeek = tempDate.getDay();
        tempDate.setDate(tempDate.getDate() - dayOfWeek);
    
        for (let i = 0; i < 42; i++) {
            const day = document.createElement('button');
            const dateStr = tempDate.toISOString().split('T')[0];
            day.className = 'day text-center text-gray-800 text-xl transition hover:text-white hover:bg-red-500 rounded-full';
            day.textContent = tempDate.getDate();
    
            // Verificar si hay eventos para este día
            if (events[dateStr]) {
                const indicator = document.createElement('span');
                indicator.style.display = 'inline-block';
                indicator.style.width = '10px';
                indicator.style.height = '10px';
                indicator.style.backgroundColor = getRandomColor();
                indicator.style.borderRadius = '50%';
                indicator.style.marginLeft = '5px';
    
                day.appendChild(indicator);
            }
    
            day.onclick = () => renderDailyView(new Date(tempDate));
            calendarGrid.appendChild(day);
            tempDate.setDate(tempDate.getDate() + 1);
        }
    }
    
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    

    prevMonth.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonth.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    function renderMonth(year, month) {
        const calendarGrid = document.createElement('div');
        calendarGrid.className = 'grid grid-cols-7 gap-1';
    
        let tempDate = new Date(year, month, 1);
        const monthStr = tempDate.toLocaleString('es-ES', { month: 'long' });
        const dayOfWeek = tempDate.getDay();
        tempDate.setDate(tempDate.getDate() - dayOfWeek);
    
        // Agregar encabezados de días de semana
        const weekdayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        for (let i = 0; i < 7; i++) {
            const weekdayHeader = document.createElement('div');
            weekdayHeader.className = 'text-center text-gray-600 font-bold';
            weekdayHeader.textContent = weekdayNames[i];
            calendarGrid.appendChild(weekdayHeader);
        }
    
        for (let i = 0; i < 42; i++) {
            const day = document.createElement('div');
            const dateStr = tempDate.toISOString().split('T')[0];
            day.className = 'text-center text-gray-800 p-2 transition hover:bg-gray-200 rounded-full';
            day.textContent = tempDate.getDate();
    
            // Verificar si hay eventos para este día
            if (events[dateStr]) {
                const indicator = document.createElement('span');
                indicator.style.display = 'inline-block';
                indicator.style.width = '6px';
                indicator.style.height = '6px';
                indicator.style.backgroundColor = getRandomColor();
                indicator.style.borderRadius = '50%';
                indicator.style.marginLeft = '2px';
    
                day.appendChild(indicator);
            }
    
            day.onclick = () => renderDailyView(new Date(tempDate));
            calendarGrid.appendChild(day);
            tempDate.setDate(tempDate.getDate() + 1);
        }
    
        const monthHeader = document.createElement('h3');
        monthHeader.className = 'text-lg font-bold mb-2';
        monthHeader.textContent = `${monthStr.charAt(0).toUpperCase() + monthStr.slice(1)} ${year}`;
    
        const monthContainer = document.createElement('div');
        monthContainer.className = 'p-4 bg-white rounded-lg shadow';
        monthContainer.appendChild(monthHeader);
        monthContainer.appendChild(calendarGrid);
    
        return monthContainer;
    }

    renderCalendar();

    function renderDailyView(date) {
        const dateString = date.toISOString().split('T')[0];
        monthlyView.style.display = 'none';
        yearlyView.style.display = 'none';
        dailyView.style.display = 'block';
        dailyView.innerHTML = '';
        dailyView.innerHTML = `<h2 class="text-2xl font-bold text-center">${date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>`;
    
        const form = document.createElement('form');
        form.innerHTML = `
        <div class="flex justify-center items-center p-10">
            <input type="text" id="newEventName" placeholder="Descripción del evento" class="rounded-xl border-transparent shadow p-2 mx-2" required>
            <input type="time" id="eventTime" class="rounded-xl shadow p-2 mx-2" required>
            <br>
            <button type="submit" class="mt-2 bg-blue-500 text-white py-2 align-middle px-4 rounded-xl hover:bg-blue-600">Agregar evento</button>
        </div>
        `;
        dailyView.appendChild(form);
    
        form.onsubmit = function(e) {
            e.preventDefault();
            const eventName = document.getElementById('newEventName').value;
            const eventTime = document.getElementById('eventTime').value;
            if (!events[dateString]) {
                events[dateString] = [];
            }
            events[dateString].push({ name: eventName, time: eventTime });
            localStorage.setItem('events', JSON.stringify(events));
            document.getElementById('newEventName').value = '';
            document.getElementById('eventTime').value = '';
            showEvents(dateString);
        };
    
        function showEvents(date) {
            if (dailyView.contains(document.getElementById('eventsList'))) {
                dailyView.removeChild(document.getElementById('eventsList'));
            }
            const eventsList = document.createElement('div');
            eventsList.id = 'eventsList';
            const eventsForDate = events[date] || [];
            eventsForDate.forEach((event, index) => {
                const eventDiv = document.createElement('div');
                eventDiv.className = 'mt-2 p-4 m-10 bg-gray-100 rounded-xl flex justify-between items-center';
                eventDiv.innerHTML = `<span>${event.time} - ${event.name}</span>
                            <button onclick="editEvent('${date}', ${index})" class="text-sm text-blue-500">Editar</button>
                            <button onclick="deleteEvent('${date}', ${index})" class="text-sm text-red-500">Eliminar</button>`;
                eventsList.appendChild(eventDiv);
            });
            dailyView.appendChild(eventsList);
        }
    
        showEvents(dateString);
    }
    
    function deleteEvent(date, index) {
        events[date].splice(index, 1);
        if (events[date].length === 0) {
            delete events[date];
        }
        localStorage.setItem('events', JSON.stringify(events));
        renderDailyView(new Date(date));
    }
    
    function editEvent(date, index) {
        const eventName = prompt("Edit the event name:", events[date][index].name);
        const eventTime = prompt("Edit the event time (HH:MM):", events[date][index].time);
        if (eventName !== null && eventTime !== null) {
            events[date][index].name = eventName;
            events[date][index].time = eventTime;
            localStorage.setItem('events', JSON.stringify(events));
            renderDailyView(new Date(date));
        }
    }
    
    dailyBtn.addEventListener('click', () => {
        renderDailyView(new Date());
    });

    monthlyBtn.addEventListener('click', () => {
        dailyView.style.display = 'none';
        yearlyView.style.display = 'none';
        monthlyView.style.display = 'block';
        renderCalendar();
    });

    yearlyBtn.addEventListener('click', () => {
        dailyView.style.display = 'none';
        monthlyView.style.display = 'none';
        yearlyView.style.display = 'block';
        renderYearly();
    });

    function renderYearly() {
        yearlyView.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-4 gap-4';
        yearlyView.appendChild(grid);
    
        const currentYear = currentDate.getFullYear();
    
        for (let month = 0; month < 12; month++) {
            const monthContainer = renderMonth(currentYear, month);
            grid.appendChild(monthContainer);
        }
    }

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
});
