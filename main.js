let messageType = document.getElementById('message-template');
let customMessage = document.getElementById('custom-message');
let customMessageHelp = document.getElementById('custom-message-help');

document.getElementById('message-template').addEventListener('change', function() {
    const customMessageInput = document.getElementById('custom-message');
    const companyInputs = document.getElementsByClassName('company');
    const nameInputs = document.getElementsByClassName('name');

    if (this.value === 'custom') {
        customMessageInput.style.display = 'block';
        customMessage.style.display = 'block';
        customMessageHelp.style.display = 'block';
    } else {
        customMessageInput.style.display = 'none';
        customMessage.style.display = 'none';
        customMessageHelp.style.display = 'none';
    }
});

document.getElementById('csvTemplate').addEventListener('click', function() {
    const csvContent = "Name,Phone,Company\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", "data:text/csv;charset=utf-8," + encodedUri);
    link.setAttribute("download", "template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
  

document.getElementById('generate').addEventListener('click', function() {
    const inputGroups = Array.from(document.getElementsByClassName('inputGroup')).map(inputGroup => ({
        name: inputGroup.getElementsByClassName('name')[0].value,
        phone: inputGroup.getElementsByClassName('phone')[0].value,
        company: inputGroup.getElementsByClassName('company')[0].value,
        status: 'Pendiente',
        link: ''
    }));
    saveDataToLocalStorage(inputGroups);
    generateLinks(inputGroups);
});

document.getElementById('csvImport').addEventListener('change', function(evt) {
    clearInputs();
    let file = evt.target.files[0];
    let reader = new FileReader();
    reader.onload = function(e) {
        let contents = e.target.result;
        let lines = contents.split('\n');
        let inputGroups = [];
        for (let i = 1; i < lines.length; i++) {
            let cells = lines[i].split(',');
            if (cells.length === 3) {
                let inputGroup = {
                    name: cells[0],
                    phone: cells[1],
                    company: cells[2],
                    status: 'Pendiente',
                    link: ''
                };
                inputGroups.push(inputGroup);
            }
        }
        clearInputs();
        inputGroups.forEach(inputGroup => {
            addInputWithValue(inputGroup.name, inputGroup.phone, inputGroup.company);
        });
        saveDataToLocalStorage(inputGroups);
        //generateLinks(inputGroups);
    };
    reader.readAsText(file);
});

document.getElementById('csvExport').addEventListener('click', function() {
    let links = document.getElementsByClassName('whatsapp-link');
    let csvContent = "data:text/csv;charset=utf-8," + "Name,Phone,Company,Link\n";
    for (let i = 0; i < links.length; i++) {
        let link = links[i];
        let csvRow = `${link.getAttribute('data-name')},${link.getAttribute('data-phone')},${link.getAttribute('data-company')},${link.href}\n`;
        csvContent += csvRow;
    }
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "export.csv");
    document.body.appendChild(link);
    link.click();
});

function addInput(inputGroup) {
    const inputContainer = document.createElement('div');
    inputContainer.className = 'inputGroup';
    inputContainer.innerHTML = `
        <input class="name" type="text" placeholder="Nombre (opcional)" value="${inputGroup ? inputGroup.name : ''}">
        <input class="phone" type="text" placeholder="Teléfono (requerido)" required value="${inputGroup ? inputGroup.phone : ''}">
        <input class="company" type="text" placeholder="Empresa (opcional)" value="${inputGroup ? inputGroup.company : ''}">
    `;
    document.getElementById('inputContainer').appendChild(inputContainer);
}

function clearInputs() {
    const inputContainer = document.getElementById('inputContainer');
    while (inputContainer.firstChild) {
        inputContainer.removeChild(inputContainer.firstChild);
    }
}

function addInputWithValue(name, phone, company) {
    const inputGroup = document.createElement('div');
    inputGroup.className = 'inputGroup';
    inputGroup.innerHTML = `
        <input class="name" type="text" placeholder="Nombre (opcional)" value="${name}">
        <input class="phone" type="text" placeholder="Teléfono (requerido)" value="${phone}" required>
        <input class="company" type="text" placeholder="Empresa (opcional)" value="${company}">
    `;
    document.getElementById('inputContainer').appendChild(inputGroup);
}

function generateLinks(inputGroups) {
    const messageTemplate = document.getElementById('message-template').value;
    const platformTemplate = document.getElementById('platform-template').value;
    const customMessage = document.getElementById('custom-message').value;
    const outputDiv = document.getElementById('output');

    const urlTemplate = platformTemplate === 'web' ? 'https://web.whatsapp.com/send?' : 'https://api.whatsapp.com/send?';

    let pendingOutputDiv = document.createElement('div');
    let sentOutputDiv = document.createElement('div');
    let divider = document.createElement('hr');

    outputDiv.innerHTML = '';

    for (const inputGroup of inputGroups) {
        const name = inputGroup.name || '';
        const phoneNumber = inputGroup.phone;
        if (!phoneNumber) continue; // Skip if no phone number is provided
        const company = inputGroup.company || 'tu empresa';

        const greeting = name ? `Hola ${name}` : 'Hola';

        let message;
        if (messageTemplate === 'account-activated') {
            message = `${greeting}, somos del equipo de soporte de Monto, queremos informarte que tu cuenta se activo correctamente.`;
        } else if (messageTemplate === 'card-invalid') {
            message = `${greeting}. Te contactamos de soporte de Monto. Prestación de ${company}, tenemos un problema para validar tu cuenta. Para que puedas disfrutar de todos los beneficios que te ofrecemos como el adelanto de tus días ya trabajados. Sólo envíanos por aquí tu número de cuenta CLABE (18 dígitos) que tengas con algún banco tradicional como HSBC, SCOTIABANK, BANAMEX, BANCOMER etc que esté a tu nombre, el nombre del banco y una foto de tu INE para validar tu identidad y realizar los cambios.`;
        } else if (messageTemplate === 'support-help') {
            message = `${greeting}, buen día! Te contactamos de soporte de Monto, prestación de ${company}, tenemos un reporte de que necesitas ayuda con tu aplicación, ¿cómo podemos ayudarte?`;
        } else if (messageTemplate === 'custom') {
            message = customMessage.replace('${name}', name).replace('${company}', company);
        }

        const messageUrl = message ? encodeURIComponent(message) : '';
        const link = `${urlTemplate}phone=521${phoneNumber}` + (message ? `&text=${messageUrl}` : '');

        const messageDiv = document.createElement('div');
        messageDiv.style.display = 'flex';
        messageDiv.style.justifyContent = 'space-between';
        messageDiv.style.alignItems = 'center';

        const linkElement = document.createElement('a');
        linkElement.href = link;
        linkElement.target = '_blank';
        linkElement.textContent = `Mensaje para ${name || 'Desconocido'} - ${phoneNumber} - ${company}`;
        linkElement.className = 'whatsapp-link btn';
        linkElement.setAttribute('data-name', name);
        linkElement.setAttribute('data-phone', phoneNumber);
        linkElement.setAttribute('data-company', company);
        linkElement.onclick = function() {
            inputGroup.status = 'Enviado';
            saveDataToLocalStorage(inputGroups);
            regenerateLinks(inputGroups);
        }

        const statusElement = document.createElement('span');
        statusElement.textContent = inputGroup.status || 'Pendiente';

        messageDiv.appendChild(linkElement);
        messageDiv.appendChild(statusElement);

        if(inputGroup.status === 'Enviado') {
            sentOutputDiv.insertBefore(messageDiv, sentOutputDiv.firstChild);
        } else {
            pendingOutputDiv.appendChild(messageDiv);
        }
    }

    outputDiv.appendChild(pendingOutputDiv);
    outputDiv.appendChild(divider);
    outputDiv.appendChild(sentOutputDiv);

    saveDataToLocalStorage(inputGroups);
}

function regenerateLinks(inputGroups) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = '';
    generateLinks(inputGroups);
}


function saveDataToLocalStorage(data) {
    localStorage.setItem('inputGroups', JSON.stringify(data));
}

function loadDataFromLocalStorage() {
    return JSON.parse(localStorage.getItem('inputGroups')) || [];
}

window.onload = function() {
    const inputGroups = loadDataFromLocalStorage();
    generateLinks(inputGroups);
}
