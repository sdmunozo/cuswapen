let messageType = document.getElementById('message-type');
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

function addInput() {
    const inputGroup = document.createElement('div');
    inputGroup.className = 'inputGroup';
    inputGroup.innerHTML = `
        <input class="name" type="text" placeholder="Nombre (opcional)">
        <input class="phone" type="text" placeholder="Teléfono (requerido)" required>
        <input class="company" type="text" placeholder="Empresa (opcional)">
    `;
    document.getElementById('inputContainer').appendChild(inputGroup);
}

function removeInput() {
    const inputContainer = document.getElementById('inputContainer');
    const inputGroups = inputContainer.getElementsByClassName('inputGroup');
    if (inputGroups.length > 1) {
        inputContainer.removeChild(inputGroups[inputGroups.length - 1]);
    }
}

function generateLinks() {
    const inputGroups = document.getElementsByClassName('inputGroup');
    const messageTemplate = document.getElementById('message-template').value;
    const platformTemplate = document.getElementById('platform-template').value;
    const customMessage = document.getElementById('custom-message').value;
    const outputDiv = document.getElementById('output');

    const urlTemplate = platformTemplate === 'web' ? 'https://web.whatsapp.com/send?' : 'https://api.whatsapp.com/send?';
    outputDiv.innerHTML = '';

    for (const inputGroup of inputGroups) {
        const name = inputGroup.getElementsByClassName('name')[0].value || '';
        const phoneNumber = inputGroup.getElementsByClassName('phone')[0].value;
        if (!phoneNumber) continue; // Skip if no phone number is provided
        const company = inputGroup.getElementsByClassName('company')[0].value || 'tu empresa';

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
        
        const linkElement = document.createElement('a');
        linkElement.href = link;
        linkElement.target = '_blank';
        linkElement.textContent = `Mensaje para ${name || 'Desconocido'}`;
        linkElement.className = 'whatsapp-link';
        
        outputDiv.appendChild(linkElement);
    }
}